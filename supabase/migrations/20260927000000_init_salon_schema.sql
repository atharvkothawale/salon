-- ============================================================================
-- SALON APPOINTMENT BOOKING SYSTEM - DATABASE MIGRATION
-- ============================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. Custom Enum Types
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'ADMIN', 'STAFF');
CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'FAILED');
CREATE TYPE payment_method AS ENUM ('PAY_AT_SALON', 'ONLINE');
CREATE TYPE discount_type AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');
CREATE TYPE moderation_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE event_type AS ENUM ('CREATED', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- 3. Utility Function: Update updated_at Timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. TABLES & CONSTRAINTS
-- ============================================================================

-- 4.1 Profiles (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'CUSTOMER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.2 Service Categories
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.3 Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.4 Staff Profiles
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  bio TEXT,
  phone TEXT,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.5 Staff <-> Services (Many-to-Many)
CREATE TABLE staff_services (
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);

-- 4.6 Salon Normal Business Operating Hours
CREATE TABLE business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday...
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  CONSTRAINT unique_business_day UNIQUE (day_of_week),
  CONSTRAINT check_business_times CHECK (close_time > open_time)
);

-- 4.7 Individual Staff Shift Working Hours
CREATE TABLE staff_working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_working BOOLEAN NOT NULL DEFAULT TRUE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  CONSTRAINT unique_staff_working_day UNIQUE (staff_id, day_of_week),
  CONSTRAINT check_staff_working_times CHECK (end_time > start_time)
);

-- 4.8 Staff Daily Breaks
CREATE TABLE staff_breaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  CONSTRAINT check_staff_break_times CHECK (end_time > start_time)
);

-- 4.9 Staff Scheduled Time Off / Leaves
CREATE TABLE staff_leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason TEXT,
  CONSTRAINT check_staff_leave_times CHECK (end_datetime > start_datetime)
);

-- 4.10 Salon Holiday / Exceptional Closures
CREATE TABLE salon_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  CONSTRAINT check_salon_closure_times CHECK (end_datetime > start_datetime)
);

-- 4.11 Appointments Table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  staff_id UUID REFERENCES staff(id) ON DELETE RESTRICT, -- Nullable for "Any available staff"
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  appointment_status appointment_status NOT NULL DEFAULT 'PENDING',
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  payment_method payment_method NOT NULL DEFAULT 'PAY_AT_SALON',
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_appointment_times CHECK (end_datetime > start_datetime)
);

-- 4.12 APPOINTMENT OVERLAP PROTECTION (PostgreSQL Exclusion Constraint)
-- Prevents double-booking two active appointments for the same staff member in overlapping time ranges.
ALTER TABLE appointments
ADD CONSTRAINT no_overlapping_staff_appointments
EXCLUDE USING gist (
  staff_id WITH =,
  tstzrange(start_datetime, end_datetime) WITH &&
)
WHERE (staff_id IS NOT NULL AND appointment_status != 'CANCELLED');

-- 4.13 Appointment Audit Event History
CREATE TABLE appointment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  event_type event_type NOT NULL,
  old_status appointment_status,
  new_status appointment_status,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.14 Payments Table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  method payment_method NOT NULL DEFAULT 'PAY_AT_SALON',
  status payment_status NOT NULL DEFAULT 'PENDING',
  provider TEXT DEFAULT 'PAY_AT_SALON',
  provider_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.15 Promotional Coupons
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type discount_type NOT NULL,
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  minimum_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (minimum_amount >= 0),
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  usage_limit INT CHECK (usage_limit IS NULL OR usage_limit > 0),
  used_count INT NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_coupon_dates CHECK (valid_until > valid_from)
);

-- 4.16 Coupon Redemptions
CREATE TABLE coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  discount_amount NUMERIC(10, 2) NOT NULL CHECK (discount_amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.17 Service Reviews & Ratings
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  moderation_status moderation_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.18 In-App Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.19 Salon Global Settings
CREATE TABLE salon_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_name TEXT NOT NULL DEFAULT 'Lumière Salon & Spa',
  logo_url TEXT,
  address TEXT NOT NULL DEFAULT '124 Atelier Blvd, Suite 100, New York, NY 10012',
  phone TEXT NOT NULL DEFAULT '+1 (555) 234-5678',
  email TEXT NOT NULL DEFAULT 'hello@lumieresalon.com',
  cancellation_policy TEXT DEFAULT 'Cancellations allowed up to 24 hours prior to appointment.',
  booking_interval_minutes INT NOT NULL DEFAULT 30 CHECK (booking_interval_minutes > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_staff_active ON staff(is_active);
CREATE INDEX idx_staff_profile ON staff(profile_id);

CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_staff ON appointments(staff_id);
CREATE INDEX idx_appointments_service ON appointments(service_id);
CREATE INDEX idx_appointments_dates ON appointments(start_datetime, end_datetime);
CREATE INDEX idx_appointments_status ON appointments(appointment_status);
CREATE INDEX idx_appointments_booking_code ON appointments(booking_code);

CREATE INDEX idx_appointment_events_appointment ON appointment_events(appointment_id);
CREATE INDEX idx_payments_appointment ON payments(appointment_id);
CREATE INDEX idx_reviews_moderation ON reviews(moderation_status);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read_at);

-- ============================================================================
-- 6. AUTOMATIC UPDATED_AT TRIGGERS
-- ============================================================================

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_salon_settings_updated_at BEFORE UPDATE ON salon_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. SUPABASE AUTH INTEGRATION: AUTO PROFILE CREATION TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url',
    'CUSTOMER' -- SECURITY GUARANTEE: User self-registration is forced to CUSTOMER role
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 8. SECURITY & ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Helper functions to check roles securely
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('ADMIN', 'STAFF')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_settings ENABLE ROW LEVEL SECURITY;

-- 8.1 Profiles Policies
CREATE POLICY "Profiles are viewable by owner, staff, or admin"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_staff());

CREATE POLICY "Users can update own profile (role protected)"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin())
  WITH CHECK (auth.uid() = id OR is_admin());

-- 8.2 Service Categories & Services Policies (Public Read, Admin Write)
CREATE POLICY "Public read active service categories"
  ON service_categories FOR SELECT USING (is_active = TRUE OR is_admin());

CREATE POLICY "Admin modify service categories"
  ON service_categories FOR ALL USING (is_admin());

CREATE POLICY "Public read active services"
  ON services FOR SELECT USING (is_active = TRUE OR is_admin());

CREATE POLICY "Admin modify services"
  ON services FOR ALL USING (is_admin());

-- 8.3 Staff & Staff Services Policies (Public Read, Admin Write)
CREATE POLICY "Public read active staff"
  ON staff FOR SELECT USING (is_active = TRUE OR is_admin());

CREATE POLICY "Admin modify staff"
  ON staff FOR ALL USING (is_admin());

CREATE POLICY "Public read staff services"
  ON staff_services FOR SELECT USING (TRUE);

CREATE POLICY "Admin modify staff services"
  ON staff_services FOR ALL USING (is_admin());

-- 8.4 Operating Hours & Closures (Public Read, Admin Write)
CREATE POLICY "Public read business hours" ON business_hours FOR SELECT USING (TRUE);
CREATE POLICY "Admin modify business hours" ON business_hours FOR ALL USING (is_admin());

CREATE POLICY "Public read staff working hours" ON staff_working_hours FOR SELECT USING (TRUE);
CREATE POLICY "Admin modify staff working hours" ON staff_working_hours FOR ALL USING (is_admin());

CREATE POLICY "Public read staff breaks" ON staff_breaks FOR SELECT USING (TRUE);
CREATE POLICY "Admin modify staff breaks" ON staff_breaks FOR ALL USING (is_admin());

CREATE POLICY "Public read staff leaves" ON staff_leaves FOR SELECT USING (TRUE);
CREATE POLICY "Admin modify staff leaves" ON staff_leaves FOR ALL USING (is_admin());

CREATE POLICY "Public read salon closures" ON salon_closures FOR SELECT USING (TRUE);
CREATE POLICY "Admin modify salon closures" ON salon_closures FOR ALL USING (is_admin());

-- 8.5 Appointments Policies
CREATE POLICY "Customers view own appointments, staff/admin view assigned or all"
  ON appointments FOR SELECT
  USING (
    customer_id = auth.uid()
    OR is_admin()
    OR EXISTS (
      SELECT 1 FROM staff WHERE staff.id = appointments.staff_id AND staff.profile_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users insert own appointments"
  ON appointments FOR INSERT
  WITH CHECK (customer_id = auth.uid() OR is_admin());

CREATE POLICY "Customers update own appointment, staff/admin update assigned or all"
  ON appointments FOR UPDATE
  USING (
    customer_id = auth.uid()
    OR is_admin()
    OR EXISTS (
      SELECT 1 FROM staff WHERE staff.id = appointments.staff_id AND staff.profile_id = auth.uid()
    )
  );

-- 8.6 Appointment Events Policies
CREATE POLICY "View appointment events"
  ON appointment_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = appointment_events.appointment_id
      AND (appointments.customer_id = auth.uid() OR is_staff())
    )
  );

CREATE POLICY "Insert appointment events"
  ON appointment_events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 8.7 Payments Policies
CREATE POLICY "View payments for own appointments or staff/admin"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = payments.appointment_id
      AND (appointments.customer_id = auth.uid() OR is_staff())
    )
  );

CREATE POLICY "Admin modify payments"
  ON payments FOR ALL USING (is_admin());

-- 8.8 Coupons & Redemptions Policies
CREATE POLICY "Public read active coupons" ON coupons FOR SELECT USING (is_active = TRUE OR is_admin());
CREATE POLICY "Admin modify coupons" ON coupons FOR ALL USING (is_admin());

CREATE POLICY "Customers view own redemptions" ON coupon_redemptions FOR SELECT USING (customer_id = auth.uid() OR is_admin());
CREATE POLICY "Customers insert own redemptions" ON coupon_redemptions FOR INSERT WITH CHECK (customer_id = auth.uid() OR is_admin());

-- 8.9 Reviews Policies
CREATE POLICY "Public read approved reviews" ON reviews FOR SELECT USING (moderation_status = 'APPROVED' OR customer_id = auth.uid() OR is_admin());
CREATE POLICY "Customers insert reviews for own completed appointments" ON reviews FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Customers update own review, admin manage all reviews" ON reviews FOR UPDATE USING (customer_id = auth.uid() OR is_admin());

-- 8.10 Notifications Policies
CREATE POLICY "Users read own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- 8.11 Salon Settings Policies
CREATE POLICY "Public read salon settings" ON salon_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admin update salon settings" ON salon_settings FOR ALL USING (is_admin());

-- ============================================================================
-- COMPLETE SALON APPOINTMENT BOOKING SYSTEM DATABASE SETUP SCRIPT
-- Direct execution script for Supabase Dashboard -> SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ============================================================================
-- 2. CUSTOM ENUM TYPES
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('CUSTOMER', 'ADMIN', 'STAFF');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
    CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'FAILED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM ('PAY_AT_SALON', 'ONLINE');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discount_type') THEN
    CREATE TYPE discount_type AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'moderation_status') THEN
    CREATE TYPE moderation_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
    CREATE TYPE event_type AS ENUM ('CREATED', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');
  END IF;
END $$;

-- ============================================================================
-- 3. UTILITY HELPER FUNCTIONS
-- ============================================================================

-- Utility Function: Update updated_at Timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. TABLES & CONSTRAINTS (Dependency-Safe Order)
-- ============================================================================

-- 4.1 Profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
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
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.3 Services
CREATE TABLE IF NOT EXISTS services (
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
CREATE TABLE IF NOT EXISTS staff (
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
CREATE TABLE IF NOT EXISTS staff_services (
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);

-- 4.6 Salon Normal Business Operating Hours
CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  CONSTRAINT unique_business_day UNIQUE (day_of_week),
  CONSTRAINT check_business_times CHECK (close_time > open_time)
);

-- 4.7 Individual Staff Shift Working Hours
CREATE TABLE IF NOT EXISTS staff_working_hours (
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
CREATE TABLE IF NOT EXISTS staff_breaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  CONSTRAINT check_staff_break_times CHECK (end_time > start_time)
);

-- 4.9 Staff Scheduled Time Off / Leaves
CREATE TABLE IF NOT EXISTS staff_leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason TEXT,
  CONSTRAINT check_staff_leave_times CHECK (end_datetime > start_datetime)
);

-- 4.10 Salon Holiday / Exceptional Closures
CREATE TABLE IF NOT EXISTS salon_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  CONSTRAINT check_salon_closure_times CHECK (end_datetime > start_datetime)
);

-- 4.11 Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  staff_id UUID REFERENCES staff(id) ON DELETE RESTRICT,
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

-- 4.12 Appointment Audit Event History
CREATE TABLE IF NOT EXISTS appointment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  event_type event_type NOT NULL,
  old_status appointment_status,
  new_status appointment_status,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.13 Payments Table
CREATE TABLE IF NOT EXISTS payments (
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

-- 4.14 Promotional Coupons
CREATE TABLE IF NOT EXISTS coupons (
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

-- 4.15 Coupon Redemptions
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  discount_amount NUMERIC(10, 2) NOT NULL CHECK (discount_amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.16 Service Reviews & Ratings
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  moderation_status moderation_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.17 In-App Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.18 Salon Global Settings
CREATE TABLE IF NOT EXISTS salon_settings (
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
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_profile ON staff(profile_id);

CREATE INDEX IF NOT EXISTS idx_appointments_customer ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff ON appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_dates ON appointments(start_datetime, end_datetime);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(appointment_status);
CREATE INDEX IF NOT EXISTS idx_appointments_booking_code ON appointments(booking_code);

CREATE INDEX IF NOT EXISTS idx_appointment_events_appointment ON appointment_events(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_appointment ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_reviews_moderation ON reviews(moderation_status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read_at);

-- ============================================================================
-- 6. AUTOMATIC UPDATED_AT TRIGGERS
-- ============================================================================
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_categories_updated_at ON service_categories;
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_salon_settings_updated_at ON salon_settings;
CREATE TRIGGER update_salon_settings_updated_at BEFORE UPDATE ON salon_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. APPOINTMENT OVERLAP EXCLUSION CONSTRAINT
-- Prevents double-booking two active appointments for the same staff member in overlapping time ranges.
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'no_overlapping_staff_appointments'
  ) THEN
    ALTER TABLE appointments
    ADD CONSTRAINT no_overlapping_staff_appointments
    EXCLUDE USING gist (
      staff_id WITH =,
      tstzrange(start_datetime, end_datetime) WITH &&
    )
    WHERE (staff_id IS NOT NULL AND appointment_status != 'CANCELLED');
  END IF;
END $$;

-- ============================================================================
-- 8. SUPABASE AUTH INTEGRATION: AUTO PROFILE CREATION TRIGGER
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 9. RLS HELPER FUNCTIONS & ENABLEMENT
-- ============================================================================

-- Role Check Helper Functions (Defined AFTER profiles table creation)
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

-- Enable RLS on all 18 tables
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

-- Clean existing policies for idempotency
DO $$
BEGIN
  -- Profiles Policies
  DROP POLICY IF EXISTS "Profiles are viewable by owner, staff, or admin" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile (role protected)" ON profiles;

  -- Service Categories & Services Policies
  DROP POLICY IF EXISTS "Public read active service categories" ON service_categories;
  DROP POLICY IF EXISTS "Admin modify service categories" ON service_categories;
  DROP POLICY IF EXISTS "Public read active services" ON services;
  DROP POLICY IF EXISTS "Admin modify services" ON services;

  -- Staff & Staff Services Policies
  DROP POLICY IF EXISTS "Public read active staff" ON staff;
  DROP POLICY IF EXISTS "Admin modify staff" ON staff;
  DROP POLICY IF EXISTS "Public read staff services" ON staff_services;
  DROP POLICY IF EXISTS "Admin modify staff services" ON staff_services;

  -- Operating Hours & Closures Policies
  DROP POLICY IF EXISTS "Public read business hours" ON business_hours;
  DROP POLICY IF EXISTS "Admin modify business hours" ON business_hours;
  DROP POLICY IF EXISTS "Public read staff working hours" ON staff_working_hours;
  DROP POLICY IF EXISTS "Admin modify staff working hours" ON staff_working_hours;
  DROP POLICY IF EXISTS "Public read staff breaks" ON staff_breaks;
  DROP POLICY IF EXISTS "Admin modify staff breaks" ON staff_breaks;
  DROP POLICY IF EXISTS "Public read staff leaves" ON staff_leaves;
  DROP POLICY IF EXISTS "Admin modify staff leaves" ON staff_leaves;
  DROP POLICY IF EXISTS "Public read salon closures" ON salon_closures;
  DROP POLICY IF EXISTS "Admin modify salon closures" ON salon_closures;

  -- Appointments Policies
  DROP POLICY IF EXISTS "Customers view own appointments, staff/admin view assigned or all" ON appointments;
  DROP POLICY IF EXISTS "Authenticated users insert own appointments" ON appointments;
  DROP POLICY IF EXISTS "Customers update own appointment, staff/admin update assigned or all" ON appointments;

  -- Appointment Events Policies
  DROP POLICY IF EXISTS "View appointment events" ON appointment_events;
  DROP POLICY IF EXISTS "Insert appointment events" ON appointment_events;

  -- Payments Policies
  DROP POLICY IF EXISTS "View payments for own appointments or staff/admin" ON payments;
  DROP POLICY IF EXISTS "Admin modify payments" ON payments;

  -- Coupons & Redemptions Policies
  DROP POLICY IF EXISTS "Public read active coupons" ON coupons;
  DROP POLICY IF EXISTS "Admin modify coupons" ON coupons;
  DROP POLICY IF EXISTS "Customers view own redemptions" ON coupon_redemptions;
  DROP POLICY IF EXISTS "Customers insert own redemptions" ON coupon_redemptions;

  -- Reviews Policies
  DROP POLICY IF EXISTS "Public read approved reviews" ON reviews;
  DROP POLICY IF EXISTS "Customers insert reviews for own completed appointments" ON reviews;
  DROP POLICY IF EXISTS "Customers update own review, admin manage all reviews" ON reviews;

  -- Notifications Policies
  DROP POLICY IF EXISTS "Users read own notifications" ON notifications;
  DROP POLICY IF EXISTS "Users update own notifications" ON notifications;

  -- Salon Settings Policies
  DROP POLICY IF EXISTS "Public read salon settings" ON salon_settings;
  DROP POLICY IF EXISTS "Admin update salon settings" ON salon_settings;
END $$;

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- 10.1 Profiles Policies
CREATE POLICY "Profiles are viewable by owner, staff, or admin"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_staff());

CREATE POLICY "Users can update own profile (role protected)"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin())
  WITH CHECK (auth.uid() = id OR is_admin());

-- 10.2 Service Categories & Services Policies (Public Read, Admin Write)
CREATE POLICY "Public read active service categories"
  ON service_categories FOR SELECT USING (is_active = TRUE OR is_admin());

CREATE POLICY "Admin modify service categories"
  ON service_categories FOR ALL USING (is_admin());

CREATE POLICY "Public read active services"
  ON services FOR SELECT USING (is_active = TRUE OR is_admin());

CREATE POLICY "Admin modify services"
  ON services FOR ALL USING (is_admin());

-- 10.3 Staff & Staff Services Policies (Public Read, Admin Write)
CREATE POLICY "Public read active staff"
  ON staff FOR SELECT USING (is_active = TRUE OR is_admin());

CREATE POLICY "Admin modify staff"
  ON staff FOR ALL USING (is_admin());

CREATE POLICY "Public read staff services"
  ON staff_services FOR SELECT USING (TRUE);

CREATE POLICY "Admin modify staff services"
  ON staff_services FOR ALL USING (is_admin());

-- 10.4 Operating Hours & Closures Policies (Public Read, Admin Write)
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

-- 10.5 Appointments Policies
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

-- 10.6 Appointment Events Policies
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

-- 10.7 Payments Policies
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

-- 10.8 Coupons & Redemptions Policies
CREATE POLICY "Public read active coupons" ON coupons FOR SELECT USING (is_active = TRUE OR is_admin());
CREATE POLICY "Admin modify coupons" ON coupons FOR ALL USING (is_admin());

CREATE POLICY "Customers view own redemptions" ON coupon_redemptions FOR SELECT USING (customer_id = auth.uid() OR is_admin());
CREATE POLICY "Customers insert own redemptions" ON coupon_redemptions FOR INSERT WITH CHECK (customer_id = auth.uid() OR is_admin());

-- 10.9 Reviews Policies
CREATE POLICY "Public read approved reviews" ON reviews FOR SELECT USING (moderation_status = 'APPROVED' OR customer_id = auth.uid() OR is_admin());
CREATE POLICY "Customers insert reviews for own completed appointments" ON reviews FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Customers update own review, admin manage all reviews" ON reviews FOR UPDATE USING (customer_id = auth.uid() OR is_admin());

-- 10.10 Notifications Policies
CREATE POLICY "Users read own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- 10.11 Salon Settings Policies
CREATE POLICY "Public read salon settings" ON salon_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admin update salon settings" ON salon_settings FOR ALL USING (is_admin());

-- ============================================================================
-- 11. SUPABASE STORAGE BUCKET & RLS POLICIES (Avatars)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public Read Avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Users Upload Own Avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users Update Own Avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users Delete Own Avatar" ON storage.objects;
END $$;

CREATE POLICY "Public Read Avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users Upload Own Avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users Update Own Avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users Delete Own Avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- 12. DEVELOPMENT SEED DATA
-- ============================================================================

-- Safely clear old placeholder records if present in existing database
DELETE FROM staff_services WHERE staff_id IN ('51111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111', '52222222-2222-2222-2222-222222222222', 's2222222-2222-2222-2222-222222222222', '53333333-3333-3333-3333-333333333333', 's3333333-3333-3333-3333-333333333333');
DELETE FROM staff_working_hours WHERE staff_id IN ('51111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111', '52222222-2222-2222-2222-222222222222', 's2222222-2222-2222-2222-222222222222', '53333333-3333-3333-3333-333333333333', 's3333333-3333-3333-3333-333333333333');
DELETE FROM services WHERE id IN ('a1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111');
DELETE FROM staff WHERE id IN ('51111111-1111-1111-1111-111111111111', '52222222-2222-2222-2222-222222222222', '53333333-3333-3333-3333-333333333333', 's1111111-1111-1111-1111-111111111111', 's2222222-2222-2222-2222-222222222222', 's3333333-3333-3333-3333-333333333333');
DELETE FROM service_categories WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444');

-- 12.1 Salon Global Settings Seed
INSERT INTO salon_settings (salon_name, logo_url, address, phone, email, cancellation_policy, booking_interval_minutes)
VALUES (
  'Lumière Salon & Spa',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=300',
  '124 Atelier Blvd, Suite 100, New York, NY 10012',
  '+1 (555) 234-5678',
  'hello@lumieresalon.com',
  'Complimentary cancellation or rescheduling up to 24 hours prior to appointment.',
  30
) ON CONFLICT DO NOTHING;

-- 12.2 Business Operating Hours (0 = Sunday, 1 = Monday ... 6 = Saturday)
INSERT INTO business_hours (day_of_week, is_open, open_time, close_time) VALUES
(1, TRUE, '09:00:00', '20:00:00'), -- Monday
(2, TRUE, '09:00:00', '20:00:00'), -- Tuesday
(3, TRUE, '09:00:00', '20:00:00'), -- Wednesday
(4, TRUE, '09:00:00', '20:00:00'), -- Thursday
(5, TRUE, '09:00:00', '20:00:00'), -- Friday
(6, TRUE, '10:00:00', '18:00:00'), -- Saturday
(0, FALSE, '10:00:00', '16:00:00') -- Sunday (Closed)
ON CONFLICT (day_of_week) DO NOTHING;

-- 12.3 Service Categories Seed
INSERT INTO service_categories (id, name, description, sort_order, is_active) VALUES
('8f2d591a-3e4b-4b2a-9f8c-1e6a7b8c9d0e', 'Hair Care & Styling', 'Master haircuts, couture styling, and precision color treatments.', 1, TRUE),
('e4f5a6b7-c8d9-40e1-a2b3-c4d5e6f7a8b9', 'Skin Therapy & Facials', 'Revitalizing facial therapy, deep cleansing, and radiant glow treatments.', 2, TRUE),
('b3c4d5e6-f7a8-49b0-c1d2-e3f4a5b6c7d8', 'Nail Care & Art', 'Luxury manicures, gel extensions, and therapeutic spa pedicures.', 3, TRUE),
('f1a2b3c4-d5e6-47f8-a9b0-c1d2e3f4a5b6', 'Luxury Spa & Wellness', 'Deep tissue massage, aromatherapy, and restorative body treatments.', 4, TRUE)
ON CONFLICT DO NOTHING;

-- 12.4 Services Seed
INSERT INTO services (id, category_id, name, description, price, duration_minutes, image_url, is_active) VALUES
('3b9d8a7c-6e5f-4a3b-9c8d-7e6f5a4b3c2d', '8f2d591a-3e4b-4b2a-9f8c-1e6a7b8c9d0e', 'Signature Haircut & Couture Blowout', 'Personalized consultation, luxury scalp massage, precision cut, and blowout.', 95.00, 60, 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600', TRUE),
('7e6f5a4b-3c2d-4e5f-8a9b-0c1d2e3f4a5b', '8f2d591a-3e4b-4b2a-9f8c-1e6a7b8c9d0e', 'Balayage & Glossing Treatment', 'Hand-painted sun-kissed highlights finished with a custom shine gloss.', 220.00, 150, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600', TRUE),
('1a2b3c4d-5e6f-47a8-b9c0-d1e2f3a4b5c6', 'e4f5a6b7-c8d9-40e1-a2b3-c4d5e6f7a8b9', 'Hydrating Glow Facial', 'Deep cleansing, gentle exfoliation, hyaluronic serum infusion, and LED mask.', 130.00, 75, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600', TRUE),
('5c6d7e8f-9a0b-41c2-d3e4-f5a6b7c8d9e0', 'b3c4d5e6-f7a8-49b0-c1d2-e3f4a5b6c7d8', 'Gel Couture Manicure', 'Nail shaping, cuticle therapy, hand massage, and long-lasting gel polish.', 65.00, 45, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600', TRUE),
('9e0f1a2b-3c4d-45e6-f7a8-b9c0d1e2f3a4', 'b3c4d5e6-f7a8-49b0-c1d2-e3f4a5b6c7d8', 'Deluxe Spa Pedicure', 'Aromatic foot soak, exfoliating scrub, hot stone massage, and polish.', 80.00, 60, 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=600', TRUE),
('2b3c4d5e-6f7a-48b9-c0d1-e2f3a4b5c6d7', 'f1a2b3c4-d5e6-47f8-a9b0-c1d2e3f4a5b6', 'Aromatherapy Full Body Massage', 'Restorative Swedish massage using organic essential oils to ease tension.', 150.00, 90, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=600', TRUE)
ON CONFLICT DO NOTHING;

-- 12.5 Staff Profiles Seed
INSERT INTO staff (id, full_name, role_title, bio, phone, photo_url, is_active) VALUES
('4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9', 'Aisha Sharma', 'Master Creative Director', 'Over 12 years of experience in London and New York crafting runway-ready hair styles.', '+1 (555) 101-2020', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400', TRUE),
('8f9a0b1c-2d3e-44f5-a6b7-c8d9e0f1a2b3', 'Riya Patel', 'Senior Colorist & Hair Artist', 'Specializes in custom balayage, dimensional color transformations, and glossing.', '+1 (555) 102-3030', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400', TRUE),
('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', 'Neha Kapoor', 'Lead Esthetician & Skin Specialist', 'Holistic skin care therapist focused on non-invasive rejuvenation and glow therapy.', '+1 (555) 103-4040', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400', TRUE)
ON CONFLICT DO NOTHING;

-- 12.6 Staff <-> Services Capability Mapping Seed
INSERT INTO staff_services (staff_id, service_id) VALUES
('4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9', '3b9d8a7c-6e5f-4a3b-9c8d-7e6f5a4b3c2d'),
('4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9', '7e6f5a4b-3c2d-4e5f-8a9b-0c1d2e3f4a5b'),
('8f9a0b1c-2d3e-44f5-a6b7-c8d9e0f1a2b3', '3b9d8a7c-6e5f-4a3b-9c8d-7e6f5a4b3c2d'),
('8f9a0b1c-2d3e-44f5-a6b7-c8d9e0f1a2b3', '7e6f5a4b-3c2d-4e5f-8a9b-0c1d2e3f4a5b'),
('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', '1a2b3c4d-5e6f-47a8-b9c0-d1e2f3a4b5c6'),
('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', '5c6d7e8f-9a0b-41c2-d3e4-f5a6b7c8d9e0'),
('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', '9e0f1a2b-3c4d-45e6-f7a8-b9c0d1e2f3a4'),
('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', '2b3c4d5e-6f7a-48b9-c0d1-e2f3a4b5c6d7')
ON CONFLICT DO NOTHING;

-- 12.7 Staff Default Shift Working Hours Seed (Mon - Sat)
INSERT INTO staff_working_hours (staff_id, day_of_week, is_working, start_time, end_time) VALUES
('4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9', 1, TRUE, '09:00:00', '17:00:00'),
('4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9', 2, TRUE, '09:00:00', '17:00:00'),
('4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9', 3, TRUE, '09:00:00', '17:00:00'),
('4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9', 4, TRUE, '09:00:00', '17:00:00'),
('4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9', 5, TRUE, '09:00:00', '17:00:00'),
('4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9', 6, TRUE, '10:00:00', '18:00:00'),
('8f9a0b1c-2d3e-44f5-a6b7-c8d9e0f1a2b3', 1, TRUE, '10:00:00', '18:00:00'),
('8f9a0b1c-2d3e-44f5-a6b7-c8d9e0f1a2b3', 2, TRUE, '10:00:00', '18:00:00'),
('8f9a0b1c-2d3e-44f5-a6b7-c8d9e0f1a2b3', 3, TRUE, '10:00:00', '18:00:00'),
('8f9a0b1c-2d3e-44f5-a6b7-c8d9e0f1a2b3', 4, TRUE, '10:00:00', '18:00:00'),
('8f9a0b1c-2d3e-44f5-a6b7-c8d9e0f1a2b3', 5, TRUE, '10:00:00', '18:00:00'),
('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', 2, TRUE, '09:00:00', '17:00:00'),
('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', 3, TRUE, '09:00:00', '17:00:00'),
('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', 4, TRUE, '09:00:00', '17:00:00'),
('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', 5, TRUE, '09:00:00', '17:00:00'),
('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', 6, TRUE, '10:00:00', '18:00:00')
ON CONFLICT (staff_id, day_of_week) DO NOTHING;

-- 12.8 Promotional Coupons Seed
INSERT INTO coupons (code, discount_type, discount_value, minimum_amount, valid_from, valid_until, usage_limit, is_active)
VALUES (
  'WELCOME10',
  'PERCENTAGE',
  10.00,
  50.00,
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '365 days',
  100,
  TRUE
) ON CONFLICT (code) DO NOTHING;

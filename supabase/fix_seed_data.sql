-- ============================================================================
-- FIX SEED DATA: CLEANUP OLD PLACEHOLDERS & INSERT CONSISTENT REAL UUID v4 SEED DATA
-- Direct execution script for Supabase Dashboard -> SQL Editor
-- ============================================================================

DO $$
BEGIN

  -- 1. Safely clear old seed relationships and catalog data
  DELETE FROM staff_services;
  DELETE FROM staff_working_hours;
  DELETE FROM staff_breaks;
  DELETE FROM staff_leaves;
  DELETE FROM services;
  DELETE FROM staff;
  DELETE FROM service_categories;
  DELETE FROM business_hours;
  DELETE FROM salon_settings;
  DELETE FROM coupons;

  -- 2. Salon Global Settings
  INSERT INTO salon_settings (id, salon_name, logo_url, address, phone, email, cancellation_policy, booking_interval_minutes)
  VALUES (
    'a1b2c3d4-e5f6-47a8-9b0c-1d2e3f4a5b6c',
    'Lumière Salon & Spa',
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=300',
    '124 Atelier Blvd, Suite 100, New York, NY 10012',
    '+1 (555) 234-5678',
    'hello@lumieresalon.com',
    'Complimentary cancellation or rescheduling up to 24 hours prior to appointment.',
    30
  );

  -- 3. Business Operating Hours (0 = Sunday, 1 = Monday ... 6 = Saturday)
  INSERT INTO business_hours (day_of_week, is_open, open_time, close_time) VALUES
  (1, TRUE, '09:00:00', '20:00:00'), -- Monday
  (2, TRUE, '09:00:00', '20:00:00'), -- Tuesday
  (3, TRUE, '09:00:00', '20:00:00'), -- Wednesday
  (4, TRUE, '09:00:00', '20:00:00'), -- Thursday
  (5, TRUE, '09:00:00', '20:00:00'), -- Friday
  (6, TRUE, '10:00:00', '18:00:00'), -- Saturday
  (0, FALSE, '10:00:00', '16:00:00'); -- Sunday (Closed)

  -- 4. Service Categories (Real RFC 4122 UUID v4)
  INSERT INTO service_categories (id, name, description, sort_order, is_active) VALUES
  ('8f2d591a-3e4b-4b2a-9f8c-1e6a7b8c9d0e', 'Hair Care & Styling', 'Master haircuts, couture styling, and precision color treatments.', 1, TRUE),
  ('e4f5a6b7-c8d9-40e1-a2b3-c4d5e6f7a8b9', 'Skin Therapy & Facials', 'Revitalizing facial therapy, deep cleansing, and radiant glow treatments.', 2, TRUE),
  ('b3c4d5e6-f7a8-49b0-c1d2-e3f4a5b6c7d8', 'Nail Care & Art', 'Luxury manicures, gel extensions, and therapeutic spa pedicures.', 3, TRUE),
  ('f1a2b3c4-d5e6-47f8-a9b0-c1d2e3f4a5b6', 'Luxury Spa & Wellness', 'Deep tissue massage, aromatherapy, and restorative body treatments.', 4, TRUE);

  -- 5. Services (Referencing Category UUIDs)
  INSERT INTO services (id, category_id, name, description, price, duration_minutes, image_url, is_active) VALUES
  ('3b9d8a7c-6e5f-4a3b-9c8d-7e6f5a4b3c2d', '8f2d591a-3e4b-4b2a-9f8c-1e6a7b8c9d0e', 'Signature Haircut & Couture Blowout', 'Personalized consultation, luxury scalp massage, precision cut, and blowout.', 95.00, 60, 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600', TRUE),
  ('7e6f5a4b-3c2d-4e5f-8a9b-0c1d2e3f4a5b', '8f2d591a-3e4b-4b2a-9f8c-1e6a7b8c9d0e', 'Balayage & Glossing Treatment', 'Hand-painted sun-kissed highlights finished with a custom shine gloss.', 220.00, 150, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600', TRUE),
  ('1a2b3c4d-5e6f-47a8-b9c0-d1e2f3a4b5c6', 'e4f5a6b7-c8d9-40e1-a2b3-c4d5e6f7a8b9', 'Hydrating Glow Facial', 'Deep cleansing, gentle exfoliation, hyaluronic serum infusion, and LED mask.', 130.00, 75, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600', TRUE),
  ('5c6d7e8f-9a0b-41c2-d3e4-f5a6b7c8d9e0', 'b3c4d5e6-f7a8-49b0-c1d2-e3f4a5b6c7d8', 'Gel Couture Manicure', 'Nail shaping, cuticle therapy, hand massage, and long-lasting gel polish.', 65.00, 45, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600', TRUE),
  ('9e0f1a2b-3c4d-45e6-f7a8-b9c0d1e2f3a4', 'b3c4d5e6-f7a8-49b0-c1d2-e3f4a5b6c7d8', 'Deluxe Spa Pedicure', 'Aromatic foot soak, exfoliating scrub, hot stone massage, and polish.', 80.00, 60, 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=600', TRUE),
  ('2b3c4d5e-6f7a-48b9-c0d1-e2f3a4b5c6d7', 'f1a2b3c4-d5e6-47f8-a9b0-c1d2e3f4a5b6', 'Aromatherapy Full Body Massage', 'Restorative Swedish massage using organic essential oils to ease tension.', 150.00, 90, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=600', TRUE);

  -- 6. Staff Profiles (Real RFC 4122 UUID v4)
  INSERT INTO staff (id, full_name, role_title, bio, phone, photo_url, is_active) VALUES
  ('4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9', 'Aisha Sharma', 'Master Creative Director', 'Over 12 years of experience in London and New York crafting runway-ready hair styles.', '+1 (555) 101-2020', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400', TRUE),
  ('8f9a0b1c-2d3e-44f5-a6b7-c8d9e0f1a2b3', 'Riya Patel', 'Senior Colorist & Hair Artist', 'Specializes in custom balayage, dimensional color transformations, and glossing.', '+1 (555) 102-3030', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400', TRUE),
  ('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', 'Neha Kapoor', 'Lead Esthetician & Skin Specialist', 'Holistic skin care therapist focused on non-invasive rejuvenation and glow therapy.', '+1 (555) 103-4040', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400', TRUE);

  -- 7. Staff <-> Services Capability Mapping
  INSERT INTO staff_services (staff_id, service_id) VALUES
  -- Aisha
  ('4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9', '3b9d8a7c-6e5f-4a3b-9c8d-7e6f5a4b3c2d'),
  ('4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9', '7e6f5a4b-3c2d-4e5f-8a9b-0c1d2e3f4a5b'),
  -- Riya
  ('8f9a0b1c-2d3e-44f5-a6b7-c8d9e0f1a2b3', '3b9d8a7c-6e5f-4a3b-9c8d-7e6f5a4b3c2d'),
  ('8f9a0b1c-2d3e-44f5-a6b7-c8d9e0f1a2b3', '7e6f5a4b-3c2d-4e5f-8a9b-0c1d2e3f4a5b'),
  -- Neha
  ('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', '1a2b3c4d-5e6f-47a8-b9c0-d1e2f3a4b5c6'),
  ('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', '5c6d7e8f-9a0b-41c2-d3e4-f5a6b7c8d9e0'),
  ('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', '9e0f1a2b-3c4d-45e6-f7a8-b9c0d1e2f3a4'),
  ('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', '2b3c4d5e-6f7a-48b9-c0d1-e2f3a4b5c6d7');

  -- 8. Staff Default Shift Working Hours (Mon - Sat)
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
  ('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', 6, TRUE, '10:00:00', '18:00:00');

  -- 9. Coupons
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
  );

END $$;

-- ============================================================================
-- SALON APPOINTMENT BOOKING SYSTEM - DEVELOPMENT SEED DATA (INDIA LOCALIZED)
-- ============================================================================

-- 1. Initialize Salon Global Settings (Baner, Pune, Maharashtra)
INSERT INTO salon_settings (salon_name, logo_url, address, phone, email, cancellation_policy, booking_interval_minutes)
VALUES (
  'Lumière Salon & Spa',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=300',
  'Baner, Pune, Maharashtra, India',
  '+91 90000 00000',
  'hello@lumieresalon.com',
  'Complimentary cancellation or rescheduling up to 24 hours prior to appointment.',
  30
) ON CONFLICT DO NOTHING;

-- 2. Business Operating Hours (0 = Sunday, 1 = Monday ... 6 = Saturday)
INSERT INTO business_hours (day_of_week, is_open, open_time, close_time) VALUES
(1, TRUE, '09:00:00', '20:00:00'), -- Monday
(2, TRUE, '09:00:00', '20:00:00'), -- Tuesday
(3, TRUE, '09:00:00', '20:00:00'), -- Wednesday
(4, TRUE, '09:00:00', '20:00:00'), -- Thursday
(5, TRUE, '09:00:00', '20:00:00'), -- Friday
(6, TRUE, '10:00:00', '18:00:00'), -- Saturday
(0, FALSE, '10:00:00', '16:00:00') -- Sunday (Closed)
ON CONFLICT (day_of_week) DO NOTHING;

-- 3. Service Categories
INSERT INTO service_categories (id, name, description, sort_order, is_active) VALUES
('8f2d591a-3e4b-4b2a-9f8c-1e6a7b8c9d0e', 'Hair Care & Styling', 'Master haircuts, hair spa, organic colouring, keratin, and couture styling.', 1, TRUE),
('e4f5a6b7-c8d9-40e1-a2b3-c4d5e6f7a8b9', 'Skin Therapy & Facials', 'Revitalizing glow facials, de-tan treatments, and deep cleansing skin rituals.', 2, TRUE),
('b3c4d5e6-f7a8-49b0-c1d2-e3f4a5b6c7d8', 'Beauty & Essentials', 'Eyebrow shaping, premium waxing, luxury manicures, and spa pedicures.', 3, TRUE),
('f1a2b3c4-d5e6-47f8-a9b0-c1d2e3f4a5b6', 'Bridal & Occasion', 'Haute bridal makeup, saree draping, engagement looks, and bridal party packages.', 4, TRUE),
('a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6', 'Men''s Grooming', 'Precision haircuts, beard styling, head massage, and mens skincare.', 5, TRUE),
('c1d2e3f4-a5b6-47c8-d9e0-f1a2b3c4d5e6', 'Luxury Spa & Packages', 'Curated wellness head-to-toe pampering packages and spa rituals.', 6, TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- 4. Services (Pricing in INR)
INSERT INTO services (id, category_id, name, description, price, duration_minutes, image_url, is_active) VALUES
('3b9d8a7c-6e5f-4a3b-9c8d-7e6f5a4b3c2d', '8f2d591a-3e4b-4b2a-9f8c-1e6a7b8c9d0e', 'Signature Haircut & Blow Dry', 'Personalized consultation, scalp massage, precision hair cut, and blowout.', 499.00, 45, 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600', TRUE),
('7e6f5a4b-3c2d-4e5f-8a9b-0c1d2e3f4a5b', '8f2d591a-3e4b-4b2a-9f8c-1e6a7b8c9d0e', 'Global Hair Colour & Gloss', 'Premium ammonia-free global hair colouring finished with custom gloss tint.', 2999.00, 120, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600', TRUE),
('1a2b3c4d-5e6f-47a8-b9c0-d1e2f3a4b5c6', 'e4f5a6b7-c8d9-40e1-a2b3-c4d5e6f7a8b9', 'Hydrating Glow Facial', 'Deep cleansing, gentle exfoliation, hyaluronic serum infusion, and glow mask.', 1499.00, 60, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600', TRUE),
('5c6d7e8f-9a0b-41c2-d3e4-f5a6b7c8d9e0', 'b3c4d5e6-f7a8-49b0-c1d2-e3f4a5b6c7d8', 'Full Arms & Legs Waxing', 'Smooth hygienic waxing with soothing post-wax aloe vera moisturizer.', 899.00, 45, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600', TRUE),
('9e0f1a2b-3c4d-45e6-f7a8-b9c0d1e2f3a4', 'b3c4d5e6-f7a8-49b0-c1d2-e3f4a5b6c7d8', 'Deluxe Spa Pedicure', 'Aromatic foot soak, exfoliating scrub, heel softening, and nail polish.', 799.00, 45, 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=600', TRUE),
('2b3c4d5e-6f7a-48b9-c0d1-e2f3a4b5c6d7', '8f2d591a-3e4b-4b2a-9f8c-1e6a7b8c9d0e', 'Keratin Hair Smoothening', 'Intensive protein smoothening treatment for frizz-free, silky hair.', 3999.00, 150, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=600', TRUE),
('d1e2f3a4-b5c6-47a8-b9c0-d1e2f3a4b5c6', 'e4f5a6b7-c8d9-40e1-a2b3-c4d5e6f7a8b9', 'Classic Cleanup & De-Tan', 'Quick skin refresh, steam pore extraction, and sun de-tan pack.', 699.00, 45, 'https://images.unsplash.com/photo-1512290900673-700242211488?auto=format&fit=crop&q=80&w=600', TRUE),
('e1f2a3b4-c5d6-47e8-f9a0-b1c2d3e4f5a6', '8f2d591a-3e4b-4b2a-9f8c-1e6a7b8c9d0e', 'Hair Spa & Scalp Therapy', 'Deep nourishing scalp cream massage, steam, and intense moisture lock.', 1299.00, 60, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600', TRUE),
('f2a3b4c5-d6e7-48f9-a0b1-c2d3e4f5a6b7', 'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6', 'Men''s Haircut & Beard Styling', 'Precision haircut, beard shaping, hot towel treatment, and styling.', 599.00, 45, 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600', TRUE),
('a3b4c5d6-e7f8-49a0-b1c2-d3e4f5a6b7c8', 'f1a2b3c4-d5e6-47f8-a9b0-c1d2e3f4a5b6', 'Bridal Makeup & Styling', 'HD bridal makeup, hair styling, saree/dupatta draping, and lashes.', 14999.00, 240, 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=600', TRUE),
('b4c5d6e7-f8a9-40b1-c2d3-e4f5a6b7c8d9', 'f1a2b3c4-d5e6-47f8-a9b0-c1d2e3f4a5b6', 'Bride & Groom Package', 'Complete bridal glow regimen for bride and grooming package for groom.', 24999.00, 360, 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600', TRUE),
('c5d6e7f8-a9b0-41c2-d3e4-f5a6b7c8d9e0', 'c1d2e3f4-a5b6-47c8-d9e0-f1a2b3c4d5e6', 'Hair Revival Spa Package', 'Nourishing Hair Spa + Scalp Treatment + Blow Dry Styling.', 2499.00, 90, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600', TRUE)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  duration_minutes = EXCLUDED.duration_minutes,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active;

-- 5. Staff Profiles (Pune / Mumbai)
INSERT INTO staff (id, full_name, role_title, bio, phone, photo_url, is_active) VALUES
('4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9', 'Aisha Sharma', 'Master Creative Director', 'Over 12 years of experience in Mumbai & Pune crafting runway-ready hair styles and couture coloring.', '+91 90000 00001', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400', TRUE),
('8f9a0b1c-2d3e-44f5-a6b7-c8d9e0f1a2b3', 'Riya Patel', 'Senior Colorist & Hair Artist', 'Specializes in custom balayage, keratin smoothening, and dimensional hair transformations.', '+91 90000 00002', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400', TRUE),
('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', 'Neha Kapoor', 'Lead Esthetician & Skin Specialist', 'Holistic skin care therapist focused on glow facials, de-tan rituals, and bridal rejuvenation.', '+91 90000 00003', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400', TRUE)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role_title = EXCLUDED.role_title,
  bio = EXCLUDED.bio,
  phone = EXCLUDED.phone,
  photo_url = EXCLUDED.photo_url,
  is_active = EXCLUDED.is_active;

-- 6. Staff <-> Services Capability Mapping
INSERT INTO staff_services (staff_id, service_id) VALUES
-- Aisha
('4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9', '3b9d8a7c-6e5f-4a3b-9c8d-7e6f5a4b3c2d'),
('4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9', '7e6f5a4b-3c2d-4e5f-8a9b-0c1d2e3f4a5b'),
('4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9', '2b3c4d5e-6f7a-48b9-c0d1-e2f3a4b5c6d7'),
('4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9', 'e1f2a3b4-c5d6-47e8-f9a0-b1c2d3e4f5a6'),
-- Riya
('8f9a0b1c-2d3e-44f5-a6b7-c8d9e0f1a2b3', '3b9d8a7c-6e5f-4a3b-9c8d-7e6f5a4b3c2d'),
('8f9a0b1c-2d3e-44f5-a6b7-c8d9e0f1a2b3', '7e6f5a4b-3c2d-4e5f-8a9b-0c1d2e3f4a5b'),
('8f9a0b1c-2d3e-44f5-a6b7-c8d9e0f1a2b3', 'f2a3b4c5-d6e7-48f9-a0b1-c2d3e4f5a6b7'),
-- Neha
('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', '1a2b3c4d-5e6f-47a8-b9c0-d1e2f3a4b5c6'),
('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', '5c6d7e8f-9a0b-41c2-d3e4-f5a6b7c8d9e0'),
('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', '9e0f1a2b-3c4d-45e6-f7a8-b9c0d1e2f3a4'),
('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', 'd1e2f3a4-b5c6-47a8-b9c0-d1e2f3a4b5c6'),
('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', 'a3b4c5d6-e7f8-49a0-b1c2-d3e4f5a6b7c8'),
('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', 'b4c5d6e7-f8a9-40b1-c2d3-e4f5a6b7c8d9'),
('c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', 'c5d6e7f8-a9b0-41c2-d3e4-f5a6b7c8d9e0')
ON CONFLICT DO NOTHING;

-- 7. Staff Default Shift Working Hours (Mon - Sat)
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

-- 8. Coupons
INSERT INTO coupons (code, discount_type, discount_value, minimum_amount, valid_from, valid_until, usage_limit, is_active)
VALUES (
  'WELCOME10',
  'PERCENTAGE',
  10.00,
  500.00,
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '365 days',
  100,
  TRUE
) ON CONFLICT (code) DO NOTHING;

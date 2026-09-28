-- ============================================================================
-- MIGRATION: REPLACE PLACEHOLDER UUIDs WITH REAL RFC 4122 UUID v4 VALUES
-- ============================================================================

DO $$
BEGIN

  -- --------------------------------------------------------------------------
  -- 1. SERVICE CATEGORIES
  -- --------------------------------------------------------------------------
  -- Hair Care & Styling
  IF EXISTS (SELECT 1 FROM service_categories WHERE id = '11111111-1111-1111-1111-111111111111') THEN
    INSERT INTO service_categories (id, name, description, sort_order, is_active, created_at, updated_at)
    SELECT '8f2d591a-3e4b-4b2a-9f8c-1e6a7b8c9d0e', name || ' (New)', description, sort_order, is_active, created_at, updated_at
    FROM service_categories WHERE id = '11111111-1111-1111-1111-111111111111'
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Skin Therapy & Facials
  IF EXISTS (SELECT 1 FROM service_categories WHERE id = '22222222-2222-2222-2222-222222222222') THEN
    INSERT INTO service_categories (id, name, description, sort_order, is_active, created_at, updated_at)
    SELECT 'e4f5a6b7-c8d9-40e1-a2b3-c4d5e6f7a8b9', name || ' (New)', description, sort_order, is_active, created_at, updated_at
    FROM service_categories WHERE id = '22222222-2222-2222-2222-222222222222'
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Nail Care & Art
  IF EXISTS (SELECT 1 FROM service_categories WHERE id = '33333333-3333-3333-3333-333333333333') THEN
    INSERT INTO service_categories (id, name, description, sort_order, is_active, created_at, updated_at)
    SELECT 'b3c4d5e6-f7a8-49b0-c1d2-e3f4a5b6c7d8', name || ' (New)', description, sort_order, is_active, created_at, updated_at
    FROM service_categories WHERE id = '33333333-3333-3333-3333-333333333333'
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Luxury Spa & Wellness
  IF EXISTS (SELECT 1 FROM service_categories WHERE id = '44444444-4444-4444-4444-444444444444') THEN
    INSERT INTO service_categories (id, name, description, sort_order, is_active, created_at, updated_at)
    SELECT 'f1a2b3c4-d5e6-47f8-a9b0-c1d2e3f4a5b6', name || ' (New)', description, sort_order, is_active, created_at, updated_at
    FROM service_categories WHERE id = '44444444-4444-4444-4444-444444444444'
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- --------------------------------------------------------------------------
  -- 2. SERVICES
  -- --------------------------------------------------------------------------
  -- Signature Haircut & Couture Blowout
  IF EXISTS (SELECT 1 FROM services WHERE id = 'a1111111-1111-1111-1111-111111111111') THEN
    INSERT INTO services (id, category_id, name, description, price, duration_minutes, image_url, is_active, created_at, updated_at)
    SELECT '3b9d8a7c-6e5f-4a3b-9c8d-7e6f5a4b3c2d', '8f2d591a-3e4b-4b2a-9f8c-1e6a7b8c9d0e', name, description, price, duration_minutes, image_url, is_active, created_at, updated_at
    FROM services WHERE id = 'a1111111-1111-1111-1111-111111111111'
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Balayage & Glossing Treatment
  IF EXISTS (SELECT 1 FROM services WHERE id = 'a2222222-2222-2222-2222-222222222222') THEN
    INSERT INTO services (id, category_id, name, description, price, duration_minutes, image_url, is_active, created_at, updated_at)
    SELECT '7e6f5a4b-3c2d-4e5f-8a9b-0c1d2e3f4a5b', '8f2d591a-3e4b-4b2a-9f8c-1e6a7b8c9d0e', name, description, price, duration_minutes, image_url, is_active, created_at, updated_at
    FROM services WHERE id = 'a2222222-2222-2222-2222-222222222222'
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Hydrating Glow Facial
  IF EXISTS (SELECT 1 FROM services WHERE id = 'b1111111-1111-1111-1111-111111111111') THEN
    INSERT INTO services (id, category_id, name, description, price, duration_minutes, image_url, is_active, created_at, updated_at)
    SELECT '1a2b3c4d-5e6f-47a8-b9c0-d1e2f3a4b5c6', 'e4f5a6b7-c8d9-40e1-a2b3-c4d5e6f7a8b9', name, description, price, duration_minutes, image_url, is_active, created_at, updated_at
    FROM services WHERE id = 'b1111111-1111-1111-1111-111111111111'
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Gel Couture Manicure
  IF EXISTS (SELECT 1 FROM services WHERE id = 'c1111111-1111-1111-1111-111111111111') THEN
    INSERT INTO services (id, category_id, name, description, price, duration_minutes, image_url, is_active, created_at, updated_at)
    SELECT '5c6d7e8f-9a0b-41c2-d3e4-f5a6b7c8d9e0', 'b3c4d5e6-f7a8-49b0-c1d2-e3f4a5b6c7d8', name, description, price, duration_minutes, image_url, is_active, created_at, updated_at
    FROM services WHERE id = 'c1111111-1111-1111-1111-111111111111'
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Deluxe Spa Pedicure
  IF EXISTS (SELECT 1 FROM services WHERE id = 'c2222222-2222-2222-2222-222222222222') THEN
    INSERT INTO services (id, category_id, name, description, price, duration_minutes, image_url, is_active, created_at, updated_at)
    SELECT '9e0f1a2b-3c4d-45e6-f7a8-b9c0d1e2f3a4', 'b3c4d5e6-f7a8-49b0-c1d2-e3f4a5b6c7d8', name, description, price, duration_minutes, image_url, is_active, created_at, updated_at
    FROM services WHERE id = 'c2222222-2222-2222-2222-222222222222'
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Aromatherapy Full Body Massage
  IF EXISTS (SELECT 1 FROM services WHERE id = 'd1111111-1111-1111-1111-111111111111') THEN
    INSERT INTO services (id, category_id, name, description, price, duration_minutes, image_url, is_active, created_at, updated_at)
    SELECT '2b3c4d5e-6f7a-48b9-c0d1-e2f3a4b5c6d7', 'f1a2b3c4-d5e6-47f8-a9b0-c1d2e3f4a5b6', name, description, price, duration_minutes, image_url, is_active, created_at, updated_at
    FROM services WHERE id = 'd1111111-1111-1111-1111-111111111111'
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- --------------------------------------------------------------------------
  -- 3. STAFF
  -- --------------------------------------------------------------------------
  -- Aisha Sharma
  IF EXISTS (SELECT 1 FROM staff WHERE id IN ('51111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111')) THEN
    INSERT INTO staff (id, profile_id, full_name, role_title, bio, phone, photo_url, is_active, created_at, updated_at)
    SELECT '4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9', profile_id, full_name, role_title, bio, phone, photo_url, is_active, created_at, updated_at
    FROM staff WHERE id IN ('51111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111')
    LIMIT 1
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Riya Patel
  IF EXISTS (SELECT 1 FROM staff WHERE id IN ('52222222-2222-2222-2222-222222222222', 's2222222-2222-2222-2222-222222222222')) THEN
    INSERT INTO staff (id, profile_id, full_name, role_title, bio, phone, photo_url, is_active, created_at, updated_at)
    SELECT '8f9a0b1c-2d3e-44f5-a6b7-c8d9e0f1a2b3', profile_id, full_name, role_title, bio, phone, photo_url, is_active, created_at, updated_at
    FROM staff WHERE id IN ('52222222-2222-2222-2222-222222222222', 's2222222-2222-2222-2222-222222222222')
    LIMIT 1
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Neha Kapoor
  IF EXISTS (SELECT 1 FROM staff WHERE id IN ('53333333-3333-3333-3333-333333333333', 's3333333-3333-3333-3333-333333333333')) THEN
    INSERT INTO staff (id, profile_id, full_name, role_title, bio, phone, photo_url, is_active, created_at, updated_at)
    SELECT 'c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3', profile_id, full_name, role_title, bio, phone, photo_url, is_active, created_at, updated_at
    FROM staff WHERE id IN ('53333333-3333-3333-3333-333333333333', 's3333333-3333-3333-3333-333333333333')
    LIMIT 1
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- --------------------------------------------------------------------------
  -- 4. REPOINT DEPENDENT FOREIGN KEYS
  -- --------------------------------------------------------------------------

  -- 4.1 staff_services
  UPDATE staff_services SET service_id = '3b9d8a7c-6e5f-4a3b-9c8d-7e6f5a4b3c2d' WHERE service_id = 'a1111111-1111-1111-1111-111111111111';
  UPDATE staff_services SET service_id = '7e6f5a4b-3c2d-4e5f-8a9b-0c1d2e3f4a5b' WHERE service_id = 'a2222222-2222-2222-2222-222222222222';
  UPDATE staff_services SET service_id = '1a2b3c4d-5e6f-47a8-b9c0-d1e2f3a4b5c6' WHERE service_id = 'b1111111-1111-1111-1111-111111111111';
  UPDATE staff_services SET service_id = '5c6d7e8f-9a0b-41c2-d3e4-f5a6b7c8d9e0' WHERE service_id = 'c1111111-1111-1111-1111-111111111111';
  UPDATE staff_services SET service_id = '9e0f1a2b-3c4d-45e6-f7a8-b9c0d1e2f3a4' WHERE service_id = 'c2222222-2222-2222-2222-222222222222';
  UPDATE staff_services SET service_id = '2b3c4d5e-6f7a-48b9-c0d1-e2f3a4b5c6d7' WHERE service_id = 'd1111111-1111-1111-1111-111111111111';

  UPDATE staff_services SET staff_id = '4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9' WHERE staff_id IN ('51111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111');
  UPDATE staff_services SET staff_id = '8f9a0b1c-2d3e-44f5-a6b7-c8d9e0f1a2b3' WHERE staff_id IN ('52222222-2222-2222-2222-222222222222', 's2222222-2222-2222-2222-222222222222');
  UPDATE staff_services SET staff_id = 'c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3' WHERE staff_id IN ('53333333-3333-3333-3333-333333333333', 's3333333-3333-3333-3333-333333333333');

  -- 4.2 staff_working_hours
  UPDATE staff_working_hours SET staff_id = '4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9' WHERE staff_id IN ('51111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111');
  UPDATE staff_working_hours SET staff_id = '8f9a0b1c-2d3e-44f5-a6b7-c8d9e0f1a2b3' WHERE staff_id IN ('52222222-2222-2222-2222-222222222222', 's2222222-2222-2222-2222-222222222222');
  UPDATE staff_working_hours SET staff_id = 'c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3' WHERE staff_id IN ('53333333-3333-3333-3333-333333333333', 's3333333-3333-3333-3333-333333333333');

  -- 4.3 staff_breaks
  UPDATE staff_breaks SET staff_id = '4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9' WHERE staff_id IN ('51111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111');
  UPDATE staff_breaks SET staff_id = '8f9a0b1c-2d3e-44f5-a6b7-c8d9e0f1a2b3' WHERE staff_id IN ('52222222-2222-2222-2222-222222222222', 's2222222-2222-2222-2222-222222222222');
  UPDATE staff_breaks SET staff_id = 'c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3' WHERE staff_id IN ('53333333-3333-3333-3333-333333333333', 's3333333-3333-3333-3333-333333333333');

  -- 4.4 staff_leaves
  UPDATE staff_leaves SET staff_id = '4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9' WHERE staff_id IN ('51111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111');
  UPDATE staff_leaves SET staff_id = '8f9a0b1c-2d3e-44f5-a6b7-c8d9e0f1a2b3' WHERE staff_id IN ('52222222-2222-2222-2222-222222222222', 's2222222-2222-2222-2222-222222222222');
  UPDATE staff_leaves SET staff_id = 'c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3' WHERE staff_id IN ('53333333-3333-3333-3333-333333333333', 's3333333-3333-3333-3333-333333333333');

  -- 4.5 appointments
  UPDATE appointments SET service_id = '3b9d8a7c-6e5f-4a3b-9c8d-7e6f5a4b3c2d' WHERE service_id = 'a1111111-1111-1111-1111-111111111111';
  UPDATE appointments SET service_id = '7e6f5a4b-3c2d-4e5f-8a9b-0c1d2e3f4a5b' WHERE service_id = 'a2222222-2222-2222-2222-222222222222';
  UPDATE appointments SET service_id = '1a2b3c4d-5e6f-47a8-b9c0-d1e2f3a4b5c6' WHERE service_id = 'b1111111-1111-1111-1111-111111111111';
  UPDATE appointments SET service_id = '5c6d7e8f-9a0b-41c2-d3e4-f5a6b7c8d9e0' WHERE service_id = 'c1111111-1111-1111-1111-111111111111';
  UPDATE appointments SET service_id = '9e0f1a2b-3c4d-45e6-f7a8-b9c0d1e2f3a4' WHERE service_id = 'c2222222-2222-2222-2222-222222222222';
  UPDATE appointments SET service_id = '2b3c4d5e-6f7a-48b9-c0d1-e2f3a4b5c6d7' WHERE service_id = 'd1111111-1111-1111-1111-111111111111';

  UPDATE appointments SET staff_id = '4d5e6f7a-8b9c-40d1-e2f3-a4b5c6d7e8f9' WHERE staff_id IN ('51111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111');
  UPDATE appointments SET staff_id = '8f9a0b1c-2d3e-44f5-a6b7-c8d9e0f1a2b3' WHERE staff_id IN ('52222222-2222-2222-2222-222222222222', 's2222222-2222-2222-2222-222222222222');
  UPDATE appointments SET staff_id = 'c8d9e0f1-a2b3-44c5-d6e7-f8a9b0c1d2e3' WHERE staff_id IN ('53333333-3333-3333-3333-333333333333', 's3333333-3333-3333-3333-333333333333');

  -- --------------------------------------------------------------------------
  -- 5. CLEAN UP OLD PLACEHOLDER RECORDS
  -- --------------------------------------------------------------------------
  DELETE FROM services WHERE id IN ('a1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111');
  DELETE FROM staff WHERE id IN ('51111111-1111-1111-1111-111111111111', '52222222-2222-2222-2222-222222222222', '53333333-3333-3333-3333-333333333333', 's1111111-1111-1111-1111-111111111111', 's2222222-2222-2222-2222-222222222222', 's3333333-3333-3333-3333-333333333333');
  DELETE FROM service_categories WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444');

  -- Update category names back if '(New)' was appended during insert
  UPDATE service_categories SET name = REPLACE(name, ' (New)', '');

END $$;

-- ========================================================
-- MUTABAAH ONLINE / QARA-A COMPLETE DATABASE SETUP
-- Generated for Supabase SQL Editor
-- ========================================================


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- SECTION: 01_initial_schema.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- Enable UUID and other extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUMS for roles and statuses
CREATE TYPE user_role AS ENUM ('admin', 'guru', 'murid');
CREATE TYPE attendance_status AS ENUM ('hadir', 'izin', 'sakit', 'alpa');
CREATE TYPE evaluation_level AS ENUM ('belum_hafal', 'hafal_tidak_lancar', 'hafal_lancar', 'hafal_sangat_lancar');

-- Institutions table
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(institution_id, email)
);

-- Semesters (for academic structure)
CREATE TABLE semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Classes (e.g., Kelas A, Kelas B)
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  guru_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(semester_id, name)
);

-- Class enrollments (students in classes)
CREATE TABLE class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(class_id, user_id)
);

-- Subjects within classes (e.g., Juz 30, Juz 29)
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sessions (e.g., daily teaching sessions)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  guru_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  session_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Attendance records
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status attendance_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(session_id, user_id)
);

-- Evaluation templates (Mutabaah template configurations)
CREATE TABLE evaluation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  evaluator_label TEXT DEFAULT 'Guru',
  evaluation_criteria JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Daily evaluations (Mutabaah records)
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES evaluation_templates(id) ON DELETE RESTRICT,
  evaluator_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  tajweed_level evaluation_level,
  hafalan_level evaluation_level,
  tartil_level evaluation_level,
  additional_notes TEXT,
  evaluation_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(session_id, user_id)
);

-- PDF report templates (for customizing generated reports)
CREATE TABLE pdf_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  header_title TEXT,
  header_subtitle TEXT,
  footer_text TEXT,
  logo_url TEXT,
  show_attendance BOOLEAN DEFAULT TRUE,
  show_evaluations BOOLEAN DEFAULT TRUE,
  show_summary BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_institution_id ON users(institution_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_classes_institution_id ON classes(institution_id);
CREATE INDEX idx_classes_semester_id ON classes(semester_id);
CREATE INDEX idx_class_enrollments_user_id ON class_enrollments(user_id);
CREATE INDEX idx_sessions_class_id ON sessions(class_id);
CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_attendance_user_id ON attendance_records(user_id);
CREATE INDEX idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX idx_evaluations_session_id ON evaluations(session_id);
CREATE INDEX idx_evaluations_created ON evaluations(created_at);

-- Enable Row Level Security
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_templates ENABLE ROW LEVEL SECURITY;

-- Create a trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER institutions_updated_at BEFORE UPDATE ON institutions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER semesters_updated_at BEFORE UPDATE ON semesters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER attendance_records_updated_at BEFORE UPDATE ON attendance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER evaluation_templates_updated_at BEFORE UPDATE ON evaluation_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER evaluations_updated_at BEFORE UPDATE ON evaluations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER pdf_templates_updated_at BEFORE UPDATE ON pdf_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- SECTION: 02_seed_test_data.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- Seed test data for Mutabaah Online system
-- This script creates test institutions and user accounts for all roles

-- Insert a test institution
INSERT INTO institutions (id, name, code, address, phone, email, description, logo_url)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Tahfidz Al-Qur''an Center',
  'TAHFIDZ-001',
  'Jl. Pendidikan No. 123, Jakarta',
  '+62-21-1234567',
  'info@tahfidztest.com',
  'Test institutional account for Learning Management System',
  NULL
)
ON CONFLICT (code) DO NOTHING;

-- Create Supabase auth users and corresponding system users
-- These will need to be created via Supabase Auth first

-- TEST ADMIN ACCOUNT
-- Email: admin@tahfidz.test
-- Password: Admin123456!
-- Role: Admin

INSERT INTO users (id, institution_id, email, full_name, role, phone, address)
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'admin@tahfidz.test',
  'Admin Tahfidz',
  'admin',
  '+62-812-3456789',
  'Jl. Admin, Jakarta'
)
ON CONFLICT (institution_id, email) DO NOTHING;

-- TEST GURU ACCOUNT (Teacher)
-- Email: guru@tahfidz.test
-- Password: Guru123456!
-- Role: Guru

INSERT INTO users (id, institution_id, email, full_name, role, phone, address)
VALUES (
  '33333333-3333-3333-3333-333333333333'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'guru@tahfidz.test',
  'Ustaz Muhammad Ali',
  'guru',
  '+62-812-9876543',
  'Jl. Guru, Jakarta'
)
ON CONFLICT (institution_id, email) DO NOTHING;

-- TEST MURID ACCOUNTS (Students) - Create 5 students for testing
INSERT INTO users (id, institution_id, email, full_name, role, phone, address)
VALUES 
  ('44444444-4444-4444-4444-444444444444'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'murid1@tahfidz.test', 'Ahmad Rizki', 'murid', '+62-812-1111111', 'Jl. Murid 1, Jakarta'),
  ('55555555-5555-5555-5555-555555555555'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'murid2@tahfidz.test', 'Fatimah Nur', 'murid', '+62-812-2222222', 'Jl. Murid 2, Jakarta'),
  ('66666666-6666-6666-6666-666666666666'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'murid3@tahfidz.test', 'Bilal Hakim', 'murid', '+62-812-3333333', 'Jl. Murid 3, Jakarta'),
  ('77777777-7777-7777-7777-777777777777'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'murid4@tahfidz.test', 'Aisha Rahman', 'murid', '+62-812-4444444', 'Jl. Murid 4, Jakarta'),
  ('88888888-8888-8888-8888-888888888888'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'murid5@tahfidz.test', 'Salman Bahri', 'murid', '+62-812-5555555', 'Jl. Murid 5, Jakarta')
ON CONFLICT (institution_id, email) DO NOTHING;

-- Create a test semester
INSERT INTO semesters (id, institution_id, name, start_date, end_date, is_active)
VALUES (
  '99999999-9999-9999-9999-999999999999'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Semester 1 - 2024/2025',
  '2024-01-01'::date,
  '2024-06-30'::date,
  true
)
ON CONFLICT DO NOTHING;

-- Create a test class with the guru as teacher
INSERT INTO classes (id, institution_id, semester_id, name, description, guru_id)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  '99999999-9999-9999-9999-999999999999'::uuid,
  'Kelas A - Tahfidz Juz 29-30',
  'Kelas pemula untuk tahfidz Juz 29 dan 30',
  '33333333-3333-3333-3333-333333333333'::uuid
)
ON CONFLICT DO NOTHING;

-- Enroll students in the class
INSERT INTO class_enrollments (class_id, user_id)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '44444444-4444-4444-4444-444444444444'::uuid),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '55555555-5555-5555-5555-555555555555'::uuid),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '66666666-6666-6666-6666-666666666666'::uuid),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '77777777-7777-7777-7777-777777777777'::uuid),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '88888888-8888-8888-8888-888888888888'::uuid)
ON CONFLICT DO NOTHING;

-- Create test subjects (Juz)
INSERT INTO subjects (id, class_id, name, description, order_index)
VALUES 
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Juz 30', 'Juz Amma', 1),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Juz 29', 'Juz Tabarak', 2)
ON CONFLICT DO NOTHING;

-- Create test evaluation template
INSERT INTO evaluation_templates (id, institution_id, name, description, evaluator_label, evaluation_criteria)
VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Mutabaah Standard',
  'Template evaluasi standar untuk Mutabaah harian',
  'Guru Tahfidz',
  '{"criteria": [
    {"name": "Tajweed", "levels": ["belum_hafal", "hafal_tidak_lancar", "hafal_lancar", "hafal_sangat_lancar"]},
    {"name": "Hafalan", "levels": ["belum_hafal", "hafal_tidak_lancar", "hafal_lancar", "hafal_sangat_lancar"]},
    {"name": "Tartil", "levels": ["belum_hafal", "hafal_tidak_lancar", "hafal_lancar", "hafal_sangat_lancar"]}
  ]}'::jsonb
)
ON CONFLICT DO NOTHING;



-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- SECTION: 05_add_rls_policies.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- Enable RLS (Already done in 01, but ensuring)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

-- 1. Users Policy: Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

-- 2. Institutions Policy: Allow authenticated users to view institutions
-- (Needed for dashboard to show institution name)
CREATE POLICY "Authenticated users can view institutions" 
ON institutions FOR SELECT 
TO authenticated 
USING (true);

-- 3. Classes/Semesters Policy: Allow users to view data linked to their institution
-- This is a simplified policy. For stricter security, you might match institution_id.

-- Allow viewing semesters in their institution
CREATE POLICY "Users can view semesters" 
ON semesters FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.institution_id = semesters.institution_id
  )
);

-- Allow viewing classes in their institution
CREATE POLICY "Users can view classes" 
ON classes FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.institution_id = classes.institution_id
  )
);



-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- SECTION: 08_fix_recursion.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- 1. Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- 2. Create a secure function to check admin status
-- SECURITY DEFINER allows this function to bypass RLS by running as the creator (postgres)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- 3. Re-create the Users policy using the function
-- This avoids recursion because the function bypasses the RLS check on 'users'
CREATE POLICY "Admins can manage all users"
ON users
FOR ALL
TO authenticated
USING (
  public.is_admin()
);

-- 4. Update other policies to use this function as well (Cleaner & Safer)
DROP POLICY IF EXISTS "Admins can manage classes" ON classes;
CREATE POLICY "Admins can manage classes" ON classes FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage semesters" ON semesters;
CREATE POLICY "Admins can manage semesters" ON semesters FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage subjects" ON subjects;
CREATE POLICY "Admins can manage subjects" ON subjects FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage enrollments" ON class_enrollments;
CREATE POLICY "Admins can manage enrollments" ON class_enrollments FOR ALL TO authenticated USING (public.is_admin());



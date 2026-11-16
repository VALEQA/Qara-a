-- ====================================================================
-- QARA-A (MUTABAAH ONLINE) COMPLETE MIGRATIONS & PERMISSIONS FIX
-- ====================================================================

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- MIGRATION: 20260116141500_create_gamification_tables.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- Up Migration
create table if not exists public.badges (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  description text not null,
  icon text not null,
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.user_badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  badge_id uuid references public.badges(id) on delete cascade not null,
  awarded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, badge_id)
);

-- Note: references public.users(id) assumes a public users table exists which maps to auth.users
-- If not, we should reference auth.users(id) directly, but usually in Supabase we have a public profile table.
-- Earlier `page.tsx` showed `supabase.from("users").select("role")`, so `public.users` exists.

-- Enable RLS
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

-- Policies
create policy "Badges are viewable by everyone" on public.badges
  for select using (true);

create policy "Authenticated users can view all earned badges" on public.user_badges
  for select to authenticated using (true);

-- Indexes
create index if not exists user_badges_user_id_idx on public.user_badges(user_id);


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- MIGRATION: 20260116143000_seed_badges.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- Seed Badges
insert into public.badges (slug, name, description, icon, category) values
  ('first-step', 'Langkah Pertama', 'Menyelesaikan evaluasi hafalan pertama', 'star', 'Milestone'),
  ('high-achiever', 'Penghafal Rajin', 'Menyelesaikan 10 sesi evaluasi', 'trophy', 'Milestone'),
  ('half-century', 'Setengah Abad', 'Mencapai 50 sesi evaluasi', 'crown', 'Milestone'),
  ('juz-30', 'Hafidz Juz 30', 'Menyelesaikan hafalan Juz 30', 'medal', 'Hafalan'),
  ('streak-7', 'Istiqomah Mingguan', 'Menghafal 7 hari berturut-turut', 'zap', 'Keaktifan')
on conflict (slug) do nothing;


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- MIGRATION: 20260116143500_leaderboard_schema.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- Up Migration

-- Add verses_count to evaluations
alter table public.evaluations 
add column if not exists verses_count integer default 0;

-- Add enable_leaderboard to classes
alter table public.classes 
add column if not exists enable_leaderboard boolean default true;


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- MIGRATION: 20260116145000_fix_rls_recursion.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- FIX INFINITE RECURSION IN RLS POLICIES
-- The previous policies directly queried the 'users' table within the 'users' policy, creating a loop.
-- This script replaces them with a SECURITY DEFINER function pattern.

-- 1. Create a secure function to check admin status
-- SECURITY DEFINER allows this function to run with the privileges of the creator
-- preventing the infinite recursion loop in RLS
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

-- 2. Drop the problematic recursive policies (if they exist)
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Admins can manage classes" ON classes;
DROP POLICY IF EXISTS "Admins can manage semesters" ON semesters;
DROP POLICY IF EXISTS "Admins can manage subjects" ON subjects;
DROP POLICY IF EXISTS "Admins can manage enrollments" ON class_enrollments;
DROP POLICY IF EXISTS "Admins can manage evaluation templates" ON evaluation_templates;
DROP POLICY IF EXISTS "Admins can manage evaluations" ON evaluations;

-- 3. Re-create policies using the secure function
-- USERS
CREATE POLICY "Admins can manage all users" ON users FOR ALL TO authenticated USING (public.is_admin());

-- CLASSES
CREATE POLICY "Admins can manage classes" ON classes FOR ALL TO authenticated USING (public.is_admin());

-- SEMESTERS
CREATE POLICY "Admins can manage semesters" ON semesters FOR ALL TO authenticated USING (public.is_admin());

-- SUBJECTS
CREATE POLICY "Admins can manage subjects" ON subjects FOR ALL TO authenticated USING (public.is_admin());

-- ENROLLMENTS
CREATE POLICY "Admins can manage enrollments" ON class_enrollments FOR ALL TO authenticated USING (public.is_admin());

-- TEMPLATES
CREATE POLICY "Admins can manage evaluation templates" ON evaluation_templates FOR ALL TO authenticated USING (public.is_admin());

-- EVALUATIONS
CREATE POLICY "Admins can manage evaluations" ON evaluations FOR ALL TO authenticated USING (public.is_admin());

-- 4. Also Ensure GURU policies are safe (Example)
-- If there are Guru policies referencing users, consider creating is_guru() function too if needed.
-- For now, the Admin recursion is the primary blocker.


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- MIGRATION: 20260116164500_admin_badges_rls.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- Enable Admin Write Access for Badges table

-- 1. DROP existing policy if it conflicts (optional, but good practice)
DROP POLICY IF EXISTS "Admins can manage badges" ON badges;

-- 2. Create Policy for Admins using the is_admin() function
CREATE POLICY "Admins can manage badges"
ON badges
FOR ALL
TO authenticated
USING (public.is_admin());

-- 3. Ensure user_badges is also manageable if needed (e.g. for manual awarding)
DROP POLICY IF EXISTS "Admins can manage user_badges" ON user_badges;

CREATE POLICY "Admins can manage user_badges"
ON user_badges
FOR ALL
TO authenticated
USING (public.is_admin());


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- MIGRATION: 20260116171500_guru_session_rls.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- Allow Gurus to MANAGE their own sessions
-- (Create, Update, Delete)

-- 1. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Gurus can insert own sessions" ON sessions;
DROP POLICY IF EXISTS "Gurus can update own sessions" ON sessions;
DROP POLICY IF EXISTS "Gurus can delete own sessions" ON sessions;
DROP POLICY IF EXISTS "Gurus can view own sessions" ON sessions;

-- 2. Create Policies

CREATE POLICY "Gurus can insert own sessions" 
ON sessions FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() = guru_id 
);

CREATE POLICY "Gurus can update own sessions" 
ON sessions FOR UPDATE
TO authenticated 
USING (
  auth.uid() = guru_id
)
WITH CHECK (
  auth.uid() = guru_id
);

CREATE POLICY "Gurus can delete own sessions" 
ON sessions FOR DELETE
TO authenticated 
USING (
  auth.uid() = guru_id
);

CREATE POLICY "Gurus can view own sessions"
ON sessions FOR SELECT
TO authenticated
USING (
  auth.uid() = guru_id
);


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- MIGRATION: 20260116182000_guru_enrollment_visibility.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- 1. Allow Gurus to view enrollments for classes they teach
-- This enables querying 'class_enrollments' where the class belongs to the logged-in Guru.
CREATE POLICY "Guru can view enrollments"
ON class_enrollments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM classes
    WHERE classes.id = class_enrollments.class_id
    AND classes.guru_id = auth.uid()
  )
);

-- 2. Allow Gurus to view Basic Info (name, etc) of Students in their classes
-- This enables querying 'users' (students) if they are enrolled in a class taught by the logged-in Guru.
CREATE POLICY "Guru can view students in their classes"
ON users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM class_enrollments ce
    JOIN classes c ON ce.class_id = c.id
    WHERE ce.user_id = users.id
    AND c.guru_id = auth.uid()
  )
);


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- MIGRATION: 20260116183000_fix_guru_recursion.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- 1. DROP the problematic policies first (Clean up)
DROP POLICY IF EXISTS "Guru can view enrollments" ON class_enrollments;
DROP POLICY IF EXISTS "Guru can view students in their classes" ON users;

-- 2. Create a SECURITY DEFINER function to safely check enrollment
-- This function runs with Admin privileges (Bypassing RLS), breaking the recursion loop.
CREATE OR REPLACE FUNCTION public.is_student_in_guru_class(student_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM class_enrollments ce
    JOIN classes c ON ce.class_id = c.id
    WHERE ce.user_id = student_id
    AND c.guru_id = auth.uid()
  );
END;
$$;

-- 3. Re-create the policies using the safe function

-- Policy for Users (Students)
CREATE POLICY "Guru can view their students"
ON users FOR SELECT TO authenticated
USING (
  public.is_student_in_guru_class(id) -- Uses the secure function
);

-- Policy for Class Enrollments
-- We can check directly here because this table is lower in the hierarchy, 
-- but using the same pattern is safer if 'classes' has complex RLS.
CREATE POLICY "Guru can view enrollments"
ON class_enrollments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM classes
    WHERE classes.id = class_enrollments.class_id
    AND classes.guru_id = auth.uid()
  )
);


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- MIGRATION: 20260116190000_seed_gamification_badges.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- Seed new badges for requested testing scenarios
INSERT INTO badges (slug, name, description, category, icon)
VALUES 
  ('hafal-juz-30', 'Hafidz Juz 30', 'Telah menyelesaikan hafalan Juz 30 dengan baik.', 'achievement', 'book-open'),
  ('streak-7-days', 'Rajin Mengaji (7 Hari)', 'Melakukan setoran hafalan selama 7 hari berturut-turut.', 'streak', 'flame')
ON CONFLICT (slug) DO NOTHING;


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- MIGRATION: 20260116191500_evaluations_rls.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- Allow Evaluators (Gurus) to view the evaluations they created
CREATE POLICY "Evaluators can view their own evaluations"
ON evaluations
FOR SELECT
TO authenticated
USING (evaluator_id = auth.uid());

-- Allow Students to view their own evaluations
CREATE POLICY "Students can view their own evaluations"
ON evaluations
FOR SELECT
TO authenticated
USING (user_id = auth.uid());


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- MIGRATION: 20260116193000_seed_templates.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- Seed common Tahfidz evaluation templates
-- Corrected: Removed 'type' column as it doesn't exist in schema
INSERT INTO evaluation_templates (name, description, institution_id)
SELECT 
  t.name, 
  t.description, 
  (SELECT id FROM institutions LIMIT 1) as institution_id
FROM (VALUES
  ('Hafalan Baru (Sabaq)', 'Setoran hafalan baru hari ini'),
  ('Murojaah Harian (Manzil)', 'Mengulang hafalan lama agar tidak lupa'),
  ('Mengulang Hafalan Baru (Sabaqi)', 'Melancarkan hafalan yang baru disetor kemarin'),
  ('Ujian Kenaikan Juz', 'Tes kelancaran satu juz penuh'),
  ('Setoran Ziyadah', 'Setoran tambahan di luar target harian')
) as t(name, description)
WHERE NOT EXISTS (
    SELECT 1 FROM evaluation_templates WHERE name = t.name
);


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- MIGRATION: 20260116213000_templates_rls.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- Enable RLS
ALTER TABLE evaluation_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view templates of their institution
CREATE POLICY "Users can view templates of their institution"
ON evaluation_templates FOR SELECT
TO authenticated
USING (
  institution_id IN (
    SELECT institution_id 
    FROM users 
    WHERE id = auth.uid()
  )
);

-- Optional: Allow reading templates with NULL institution_id (global templates)
CREATE POLICY "Users can view global templates"
ON evaluation_templates FOR SELECT
TO authenticated
USING (
  institution_id IS NULL
);


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- MIGRATION: 20260201084500_fix_guru_attendance_rls.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- 1. Attendance Records Policies
-- Drop existing policies if any (to avoid duplicates)
DROP POLICY IF EXISTS "Gurus can manage attendance for their sessions" ON attendance_records;
DROP POLICY IF EXISTS "Users can view attendance_records" ON attendance_records;

-- Unified policy for ALL operations (SELECT, INSERT, UPDATE, DELETE)
-- Only allowed if the session belongs to the Guru
CREATE POLICY "Gurus can manage attendance for their sessions"
ON attendance_records FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = attendance_records.session_id
    AND sessions.guru_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = attendance_records.session_id
    AND sessions.guru_id = auth.uid()
  )
);

-- Also allow students to see their own attendance
CREATE POLICY "Students can view their own attendance"
ON attendance_records FOR SELECT TO authenticated
USING (user_id = auth.uid());


-- 2. Evaluations Policies
-- Drop existing select-only policies to replace with unified management policy
DROP POLICY IF EXISTS "Evaluators can view their own evaluations" ON evaluations;
DROP POLICY IF EXISTS "Evaluators can manage their own evaluations" ON evaluations;

-- Allow Gurus to manage evaluations they created
CREATE POLICY "Gurus can manage their own evaluations"
ON evaluations FOR ALL TO authenticated
USING (evaluator_id = auth.uid())
WITH CHECK (evaluator_id = auth.uid());

-- Keep student view policy if not exists
DROP POLICY IF EXISTS "Students can view their own evaluations" ON evaluations;
CREATE POLICY "Students can view their own evaluations"
ON evaluations FOR SELECT TO authenticated
USING (user_id = auth.uid());


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- MIGRATION: 20260201090000_add_surah_to_evaluations.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- Add subject_id and surah_name to evaluations
ALTER TABLE evaluations 
ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS surah_name TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_evaluations_subject_id ON evaluations(subject_id);


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- MIGRATION: 20260201091500_fix_subjects_rls.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- Allow authenticated users to view subjects
-- This is needed so Gurus can select the subject (Juz) during evaluation
DROP POLICY IF EXISTS "Users can view subjects" ON subjects;

CREATE POLICY "Users can view subjects"
ON subjects FOR SELECT
TO authenticated
USING (true);

-- Ensure RLS is active
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- MIGRATION: 20260201100000_scoring_system.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- Add points column to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_verses INTEGER DEFAULT 0;

-- Function to calculate points from evaluation level
CREATE OR REPLACE FUNCTION calculate_evaluation_points(lvl evaluation_level)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE lvl
    WHEN 'hafal_sangat_lancar' THEN 20
    WHEN 'hafal_lancar' THEN 15
    WHEN 'hafal_tidak_lancar' THEN 5
    WHEN 'belum_hafal' THEN 0
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update user points when evaluation is created/updated
CREATE OR REPLACE FUNCTION update_user_points_on_evaluation()
RETURNS TRIGGER AS $$
DECLARE
  old_pts INTEGER := 0;
  new_pts INTEGER := 0;
  old_verses INTEGER := 0;
  new_verses INTEGER := 0;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    new_pts := calculate_evaluation_points(NEW.hafalan_level);
    new_verses := COALESCE(NEW.verses_count, 0);
    
    UPDATE public.users 
    SET points = points + new_pts,
        total_verses = total_verses + new_verses
    WHERE id = NEW.user_id;
    
  ELSIF (TG_OP = 'UPDATE') THEN
    old_pts := calculate_evaluation_points(OLD.hafalan_level);
    new_pts := calculate_evaluation_points(NEW.hafalan_level);
    old_verses := COALESCE(OLD.verses_count, 0);
    new_verses := COALESCE(NEW.verses_count, 0);
    
    UPDATE public.users 
    SET points = points - old_pts + new_pts,
        total_verses = total_verses - old_verses + new_verses
    WHERE id = NEW.user_id;
    
  ELSIF (TG_OP = 'DELETE') THEN
    old_pts := calculate_evaluation_points(OLD.hafalan_level);
    old_verses := COALESCE(OLD.verses_count, 0);
    
    UPDATE public.users 
    SET points = points - old_pts,
        total_verses = total_verses - old_verses
    WHERE id = OLD.user_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to evaluations
DROP TRIGGER IF EXISTS tr_update_user_points_on_eval ON public.evaluations;
CREATE TRIGGER tr_update_user_points_on_eval
AFTER INSERT OR UPDATE OR DELETE ON public.evaluations
FOR EACH ROW EXECUTE FUNCTION update_user_points_on_evaluation();

-- Trigger function for attendance points
CREATE OR REPLACE FUNCTION update_user_points_on_attendance()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF (NEW.status = 'hadir') THEN
      UPDATE public.users SET points = points + 5 WHERE id = NEW.user_id;
    END IF;
  ELSIF (TG_OP = 'UPDATE') THEN
    -- If status changed to hadir
    IF (OLD.status != 'hadir' AND NEW.status = 'hadir') THEN
      UPDATE public.users SET points = points + 5 WHERE id = NEW.user_id;
    -- If status changed from hadir
    ELSIF (OLD.status = 'hadir' AND NEW.status != 'hadir') THEN
      UPDATE public.users SET points = points - 5 WHERE id = NEW.user_id;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    IF (OLD.status = 'hadir') THEN
      UPDATE public.users SET points = points - 5 WHERE id = OLD.user_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to attendance_records
DROP TRIGGER IF EXISTS tr_update_user_points_on_attendance ON public.attendance_records;
CREATE TRIGGER tr_update_user_points_on_attendance
AFTER INSERT OR UPDATE OR DELETE ON public.attendance_records
FOR EACH ROW EXECUTE FUNCTION update_user_points_on_attendance();


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- MIGRATION: 20260201110000_parent_integration.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- Add parent role to enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'orang_tua';

-- Table for linking parents to students
CREATE TABLE IF NOT EXISTS public.parent_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(parent_id, student_id)
);

-- Enable RLS
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Parents can view their own links" ON public.parent_student_links
  FOR SELECT TO authenticated USING (auth.uid() = parent_id);

CREATE POLICY "Admins can manage links" ON public.parent_student_links
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_parent_student_links_parent_id ON public.parent_student_links(parent_id);
CREATE INDEX idx_parent_student_links_student_id ON public.parent_student_links(student_id);

-- Add RLS to evaluations so parents can see their children's data
-- Current evaluations RLS usually allows 'murid' to see their own.
-- We need to add a policy for parents.

DROP POLICY IF EXISTS "Parents can view evaluations of their linked students" ON public.evaluations;
CREATE POLICY "Parents can view evaluations of their linked students" ON public.evaluations
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links
      WHERE parent_student_links.parent_id = auth.uid()
      AND parent_student_links.student_id = evaluations.user_id
    )
  );

-- Same for attendance
DROP POLICY IF EXISTS "Parents can view attendance of their linked students" ON public.attendance_records;
CREATE POLICY "Parents can view attendance of their linked students" ON public.attendance_records
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links
      WHERE parent_student_links.parent_id = auth.uid()
      AND parent_student_links.student_id = attendance_records.user_id
    )
  );


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- SEED: Sample Active Sessions for Guru
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

INSERT INTO sessions (id, class_id, subject_id, guru_id, session_date, start_time, end_time, notes)
SELECT 
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid,
  c.id,
  (SELECT id FROM subjects WHERE class_id = c.id LIMIT 1),
  c.guru_id,
  CURRENT_DATE,
  '08:00'::time,
  '10:00'::time,
  'Sesi Tahfidz Pagi - Setoran Surah An-Naba & Murojaah'
FROM classes c
WHERE NOT EXISTS (
  SELECT 1 FROM sessions WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid
)
LIMIT 1;

INSERT INTO sessions (id, class_id, subject_id, guru_id, session_date, start_time, end_time, notes)
SELECT 
  'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid,
  c.id,
  (SELECT id FROM subjects WHERE class_id = c.id LIMIT 1),
  c.guru_id,
  CURRENT_DATE - INTERVAL '1 day',
  '08:00'::time,
  '10:00'::time,
  'Sesi Tahfidz Kemarin - Murojaah Juz Amma'
FROM classes c
WHERE NOT EXISTS (
  SELECT 1 FROM sessions WHERE id = 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid
)
LIMIT 1;

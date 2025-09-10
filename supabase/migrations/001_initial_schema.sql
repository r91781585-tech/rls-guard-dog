-- RLS Guard Dog - Initial Database Schema
-- This migration creates the core tables and Row Level Security policies

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE assignment_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE submission_status AS ENUM ('not_started', 'in_progress', 'submitted', 'graded');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'student',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile and teachers can read all profiles
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Teachers can view all profiles" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'teacher'
        )
    );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Classrooms table
CREATE TABLE public.classrooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on classrooms table
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;

-- Students can only see classrooms they're enrolled in
CREATE POLICY "Students can view enrolled classrooms" ON public.classrooms
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.classroom_enrollments 
            WHERE classroom_id = id
        )
    );

-- Teachers can view all classrooms they created
CREATE POLICY "Teachers can view own classrooms" ON public.classrooms
    FOR SELECT USING (auth.uid() = teacher_id);

-- Teachers can manage their own classrooms
CREATE POLICY "Teachers can manage own classrooms" ON public.classrooms
    FOR ALL USING (auth.uid() = teacher_id);

-- Classroom enrollments table
CREATE TABLE public.classroom_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, classroom_id)
);

-- Enable RLS on classroom_enrollments table
ALTER TABLE public.classroom_enrollments ENABLE ROW LEVEL SECURITY;

-- Students can only see their own enrollments
CREATE POLICY "Students can view own enrollments" ON public.classroom_enrollments
    FOR SELECT USING (auth.uid() = user_id);

-- Teachers can view enrollments for their classrooms
CREATE POLICY "Teachers can view classroom enrollments" ON public.classroom_enrollments
    FOR SELECT USING (
        classroom_id IN (
            SELECT id FROM public.classrooms 
            WHERE teacher_id = auth.uid()
        )
    );

-- Teachers can manage enrollments for their classrooms
CREATE POLICY "Teachers can manage classroom enrollments" ON public.classroom_enrollments
    FOR ALL USING (
        classroom_id IN (
            SELECT id FROM public.classrooms 
            WHERE teacher_id = auth.uid()
        )
    );

-- Assignments table
CREATE TABLE public.assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    max_points INTEGER DEFAULT 100,
    status assignment_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on assignments table
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Students can only see published assignments for their enrolled classrooms
CREATE POLICY "Students can view published assignments" ON public.assignments
    FOR SELECT USING (
        status = 'published' AND
        classroom_id IN (
            SELECT classroom_id FROM public.classroom_enrollments 
            WHERE user_id = auth.uid()
        )
    );

-- Teachers can view all assignments for their classrooms
CREATE POLICY "Teachers can view classroom assignments" ON public.assignments
    FOR SELECT USING (
        classroom_id IN (
            SELECT id FROM public.classrooms 
            WHERE teacher_id = auth.uid()
        )
    );

-- Teachers can manage assignments for their classrooms
CREATE POLICY "Teachers can manage classroom assignments" ON public.assignments
    FOR ALL USING (
        classroom_id IN (
            SELECT id FROM public.classrooms 
            WHERE teacher_id = auth.uid()
        )
    );

-- Progress table (tracks student progress on assignments)
CREATE TABLE public.progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
    status submission_status DEFAULT 'not_started',
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    grade TEXT,
    points_earned INTEGER,
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    graded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, assignment_id)
);

-- Enable RLS on progress table
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Students can only see their own progress
CREATE POLICY "Students can view own progress" ON public.progress
    FOR SELECT USING (auth.uid() = user_id);

-- Students can update their own progress (but not grades)
CREATE POLICY "Students can update own progress" ON public.progress
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id AND
        -- Students cannot modify grade-related fields
        (OLD.grade IS NOT DISTINCT FROM NEW.grade) AND
        (OLD.points_earned IS NOT DISTINCT FROM NEW.points_earned) AND
        (OLD.graded_at IS NOT DISTINCT FROM NEW.graded_at) AND
        (OLD.feedback IS NOT DISTINCT FROM NEW.feedback)
    );

-- Teachers can see all progress for their classroom assignments
CREATE POLICY "Teachers can view classroom progress" ON public.progress
    FOR SELECT USING (
        assignment_id IN (
            SELECT a.id FROM public.assignments a
            JOIN public.classrooms c ON a.classroom_id = c.id
            WHERE c.teacher_id = auth.uid()
        )
    );

-- Teachers can update progress for their classroom assignments
CREATE POLICY "Teachers can update classroom progress" ON public.progress
    FOR UPDATE USING (
        assignment_id IN (
            SELECT a.id FROM public.assignments a
            JOIN public.classrooms c ON a.classroom_id = c.id
            WHERE c.teacher_id = auth.uid()
        )
    );

-- Teachers can insert progress records for their classroom assignments
CREATE POLICY "Teachers can create classroom progress" ON public.progress
    FOR INSERT WITH CHECK (
        assignment_id IN (
            SELECT a.id FROM public.assignments a
            JOIN public.classrooms c ON a.classroom_id = c.id
            WHERE c.teacher_id = auth.uid()
        )
    );

-- Students can insert their own progress records
CREATE POLICY "Students can create own progress" ON public.progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_classrooms_teacher ON public.classrooms(teacher_id);
CREATE INDEX idx_classroom_enrollments_user ON public.classroom_enrollments(user_id);
CREATE INDEX idx_classroom_enrollments_classroom ON public.classroom_enrollments(classroom_id);
CREATE INDEX idx_assignments_classroom ON public.assignments(classroom_id);
CREATE INDEX idx_assignments_status ON public.assignments(status);
CREATE INDEX idx_progress_user ON public.progress(user_id);
CREATE INDEX idx_progress_assignment ON public.progress(assignment_id);
CREATE INDEX idx_progress_status ON public.progress(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_classrooms_updated_at
    BEFORE UPDATE ON public.classrooms
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_assignments_updated_at
    BEFORE UPDATE ON public.assignments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_progress_updated_at
    BEFORE UPDATE ON public.progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role AS $$
BEGIN
    RETURN (SELECT role FROM public.users WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is teacher
CREATE OR REPLACE FUNCTION public.is_teacher(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role = 'teacher' FROM public.users WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get average completion rate
CREATE OR REPLACE FUNCTION public.get_average_completion_rate()
RETURNS NUMERIC AS $$
BEGIN
    RETURN (
        SELECT COALESCE(AVG(completion_percentage), 0)
        FROM public.progress
        WHERE status != 'not_started'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get classroom statistics
CREATE OR REPLACE FUNCTION public.get_classroom_stats(classroom_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_students', (
            SELECT COUNT(*) FROM public.classroom_enrollments 
            WHERE classroom_id = classroom_uuid
        ),
        'total_assignments', (
            SELECT COUNT(*) FROM public.assignments 
            WHERE classroom_id = classroom_uuid AND status = 'published'
        ),
        'avg_completion', (
            SELECT COALESCE(AVG(p.completion_percentage), 0)
            FROM public.progress p
            JOIN public.assignments a ON p.assignment_id = a.id
            WHERE a.classroom_id = classroom_uuid
        ),
        'pending_submissions', (
            SELECT COUNT(*)
            FROM public.progress p
            JOIN public.assignments a ON p.assignment_id = a.id
            WHERE a.classroom_id = classroom_uuid 
            AND p.status IN ('not_started', 'in_progress')
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Insert trigger to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comments for documentation
COMMENT ON TABLE public.users IS 'User profiles with role-based access control';
COMMENT ON TABLE public.classrooms IS 'Virtual classrooms managed by teachers';
COMMENT ON TABLE public.classroom_enrollments IS 'Student enrollment in classrooms';
COMMENT ON TABLE public.assignments IS 'Assignments created by teachers for classrooms';
COMMENT ON TABLE public.progress IS 'Student progress tracking on assignments';

COMMENT ON POLICY "Students can view own progress" ON public.progress IS 'RLS: Students can only see their own progress records';
COMMENT ON POLICY "Teachers can view classroom progress" ON public.progress IS 'RLS: Teachers can see all progress for their classroom assignments';
COMMENT ON POLICY "Students can view enrolled classrooms" ON public.classrooms IS 'RLS: Students can only see classrooms they are enrolled in';
COMMENT ON POLICY "Teachers can view own classrooms" ON public.classrooms IS 'RLS: Teachers can view classrooms they created';
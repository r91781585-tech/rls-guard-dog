-- RLS Guard Dog - Seed Data
-- This file contains sample data for testing and demonstration

-- Insert sample users (these would normally be created through Supabase Auth)
-- Note: In production, users are created through auth.users table via Supabase Auth

-- Sample teachers
INSERT INTO public.users (id, email, full_name, role) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'prof.johnson@university.edu', 'Professor Johnson', 'teacher'),
    ('550e8400-e29b-41d4-a716-446655440002', 'dr.smith@university.edu', 'Dr. Sarah Smith', 'teacher'),
    ('550e8400-e29b-41d4-a716-446655440003', 'mr.wilson@university.edu', 'Mr. David Wilson', 'teacher');

-- Sample students
INSERT INTO public.users (id, email, full_name, role) VALUES
    ('550e8400-e29b-41d4-a716-446655440011', 'john.doe@student.edu', 'John Doe', 'student'),
    ('550e8400-e29b-41d4-a716-446655440012', 'jane.smith@student.edu', 'Jane Smith', 'student'),
    ('550e8400-e29b-41d4-a716-446655440013', 'mike.brown@student.edu', 'Mike Brown', 'student'),
    ('550e8400-e29b-41d4-a716-446655440014', 'sarah.davis@student.edu', 'Sarah Davis', 'student'),
    ('550e8400-e29b-41d4-a716-446655440015', 'alex.johnson@student.edu', 'Alex Johnson', 'student'),
    ('550e8400-e29b-41d4-a716-446655440016', 'emily.wilson@student.edu', 'Emily Wilson', 'student'),
    ('550e8400-e29b-41d4-a716-446655440017', 'chris.lee@student.edu', 'Chris Lee', 'student'),
    ('550e8400-e29b-41d4-a716-446655440018', 'lisa.garcia@student.edu', 'Lisa Garcia', 'student'),
    ('550e8400-e29b-41d4-a716-446655440019', 'tom.martinez@student.edu', 'Tom Martinez', 'student'),
    ('550e8400-e29b-41d4-a716-446655440020', 'anna.taylor@student.edu', 'Anna Taylor', 'student');

-- Sample classrooms
INSERT INTO public.classrooms (id, name, description, teacher_id) VALUES
    ('650e8400-e29b-41d4-a716-446655440001', 'Mathematics 101', 'Introduction to Calculus and Linear Algebra', '550e8400-e29b-41d4-a716-446655440001'),
    ('650e8400-e29b-41d4-a716-446655440002', 'Physics Laboratory', 'Hands-on Physics Experiments and Analysis', '550e8400-e29b-41d4-a716-446655440001'),
    ('650e8400-e29b-41d4-a716-446655440003', 'Computer Science Fundamentals', 'Programming Basics and Data Structures', '550e8400-e29b-41d4-a716-446655440002'),
    ('650e8400-e29b-41d4-a716-446655440004', 'Literature Studies', 'Modern American Literature Analysis', '550e8400-e29b-41d4-a716-446655440003'),
    ('650e8400-e29b-41d4-a716-446655440005', 'Chemistry Lab', 'Organic Chemistry Laboratory Sessions', '550e8400-e29b-41d4-a716-446655440002'),
    ('650e8400-e29b-41d4-a716-446655440006', 'History of Science', 'Evolution of Scientific Thought', '550e8400-e29b-41d4-a716-446655440003');

-- Sample classroom enrollments
INSERT INTO public.classroom_enrollments (user_id, classroom_id) VALUES
    -- Mathematics 101 enrollments
    ('550e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440015', '650e8400-e29b-41d4-a716-446655440001'),
    
    -- Physics Laboratory enrollments
    ('550e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440002'),
    ('550e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440002'),
    ('550e8400-e29b-41d4-a716-446655440015', '650e8400-e29b-41d4-a716-446655440002'),
    ('550e8400-e29b-41d4-a716-446655440017', '650e8400-e29b-41d4-a716-446655440002'),
    
    -- Computer Science Fundamentals enrollments
    ('550e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440003'),
    ('550e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440003'),
    ('550e8400-e29b-41d4-a716-446655440016', '650e8400-e29b-41d4-a716-446655440003'),
    ('550e8400-e29b-41d4-a716-446655440018', '650e8400-e29b-41d4-a716-446655440003'),
    ('550e8400-e29b-41d4-a716-446655440020', '650e8400-e29b-41d4-a716-446655440003'),
    
    -- Literature Studies enrollments
    ('550e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440004'),
    ('550e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440004'),
    ('550e8400-e29b-41d4-a716-446655440016', '650e8400-e29b-41d4-a716-446655440004'),
    ('550e8400-e29b-41d4-a716-446655440018', '650e8400-e29b-41d4-a716-446655440004'),
    ('550e8400-e29b-41d4-a716-446655440019', '650e8400-e29b-41d4-a716-446655440004'),
    
    -- Chemistry Lab enrollments
    ('550e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440005'),
    ('550e8400-e29b-41d4-a716-446655440015', '650e8400-e29b-41d4-a716-446655440005'),
    ('550e8400-e29b-41d4-a716-446655440017', '650e8400-e29b-41d4-a716-446655440005'),
    ('550e8400-e29b-41d4-a716-446655440019', '650e8400-e29b-41d4-a716-446655440005'),
    
    -- History of Science enrollments
    ('550e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440006'),
    ('550e8400-e29b-41d4-a716-446655440016', '650e8400-e29b-41d4-a716-446655440006'),
    ('550e8400-e29b-41d4-a716-446655440018', '650e8400-e29b-41d4-a716-446655440006'),
    ('550e8400-e29b-41d4-a716-446655440020', '650e8400-e29b-41d4-a716-446655440006');

-- Sample assignments
INSERT INTO public.assignments (id, title, description, classroom_id, due_date, max_points, status) VALUES
    -- Mathematics 101 assignments
    ('750e8400-e29b-41d4-a716-446655440001', 'Calculus Problem Set #1', 'Derivatives and limits practice problems', '650e8400-e29b-41d4-a716-446655440001', '2024-02-15 23:59:00+00', 100, 'published'),
    ('750e8400-e29b-41d4-a716-446655440002', 'Linear Algebra Quiz', 'Matrix operations and vector spaces', '650e8400-e29b-41d4-a716-446655440001', '2024-02-22 23:59:00+00', 50, 'published'),
    ('750e8400-e29b-41d4-a716-446655440003', 'Integration Techniques', 'Advanced integration methods', '650e8400-e29b-41d4-a716-446655440001', '2024-03-01 23:59:00+00', 100, 'published'),
    
    -- Physics Laboratory assignments
    ('750e8400-e29b-41d4-a716-446655440004', 'Pendulum Experiment Report', 'Analysis of simple harmonic motion', '650e8400-e29b-41d4-a716-446655440002', '2024-02-20 23:59:00+00', 100, 'published'),
    ('750e8400-e29b-41d4-a716-446655440005', 'Optics Lab Results', 'Light refraction and reflection measurements', '650e8400-e29b-41d4-a716-446655440002', '2024-02-28 23:59:00+00', 100, 'published'),
    
    -- Computer Science Fundamentals assignments
    ('750e8400-e29b-41d4-a716-446655440006', 'Python Programming Assignment', 'Basic data structures implementation', '650e8400-e29b-41d4-a716-446655440003', '2024-02-18 23:59:00+00', 100, 'published'),
    ('750e8400-e29b-41d4-a716-446655440007', 'Algorithm Analysis', 'Big O notation and complexity analysis', '650e8400-e29b-41d4-a716-446655440003', '2024-02-25 23:59:00+00', 100, 'published'),
    ('750e8400-e29b-41d4-a716-446655440008', 'Database Design Project', 'Relational database schema design', '650e8400-e29b-41d4-a716-446655440003', '2024-03-05 23:59:00+00', 150, 'published'),
    
    -- Literature Studies assignments
    ('750e8400-e29b-41d4-a716-446655440009', 'Essay: Modern American Authors', 'Analysis of contemporary literary themes', '650e8400-e29b-41d4-a716-446655440004', '2024-02-25 23:59:00+00', 100, 'published'),
    ('750e8400-e29b-41d4-a716-446655440010', 'Poetry Analysis', 'Interpretation of modernist poetry', '650e8400-e29b-41d4-a716-446655440004', '2024-03-03 23:59:00+00', 75, 'published'),
    
    -- Chemistry Lab assignments
    ('750e8400-e29b-41d4-a716-446655440011', 'Organic Synthesis Report', 'Multi-step synthesis procedure and analysis', '650e8400-e29b-41d4-a716-446655440005', '2024-02-22 23:59:00+00', 100, 'published'),
    ('750e8400-e29b-41d4-a716-446655440012', 'Spectroscopy Analysis', 'NMR and IR spectrum interpretation', '650e8400-e29b-41d4-a716-446655440005', '2024-03-01 23:59:00+00', 100, 'published'),
    
    -- History of Science assignments
    ('750e8400-e29b-41d4-a716-446655440013', 'Scientific Revolution Essay', 'Impact of 16th-17th century discoveries', '650e8400-e29b-41d4-a716-446655440006', '2024-02-28 23:59:00+00', 100, 'published'),
    ('750e8400-e29b-41d4-a716-446655440014', 'Timeline Project', 'Major scientific milestones visualization', '650e8400-e29b-41d4-a716-446655440006', '2024-03-07 23:59:00+00', 75, 'published');

-- Sample progress data
INSERT INTO public.progress (user_id, assignment_id, status, completion_percentage, grade, points_earned, feedback, submitted_at, graded_at) VALUES
    -- John Doe's progress
    ('550e8400-e29b-41d4-a716-446655440011', '750e8400-e29b-41d4-a716-446655440001', 'graded', 100, 'A-', 92, 'Excellent work on derivatives. Minor error in problem 7.', '2024-02-14 18:30:00+00', '2024-02-16 10:15:00+00'),
    ('550e8400-e29b-41d4-a716-446655440011', '750e8400-e29b-41d4-a716-446655440002', 'graded', 100, 'B+', 43, 'Good understanding of matrix operations.', '2024-02-21 20:45:00+00', '2024-02-23 14:20:00+00'),
    ('550e8400-e29b-41d4-a716-446655440011', '750e8400-e29b-41d4-a716-446655440004', 'graded', 100, 'A', 98, 'Outstanding lab report with thorough analysis.', '2024-02-19 16:20:00+00', '2024-02-21 11:30:00+00'),
    ('550e8400-e29b-41d4-a716-446655440011', '750e8400-e29b-41d4-a716-446655440009', 'submitted', 100, NULL, NULL, NULL, '2024-02-24 22:15:00+00', NULL),
    ('550e8400-e29b-41d4-a716-446655440011', '750e8400-e29b-41d4-a716-446655440003', 'in_progress', 75, NULL, NULL, NULL, NULL, NULL),
    
    -- Jane Smith's progress
    ('550e8400-e29b-41d4-a716-446655440012', '750e8400-e29b-41d4-a716-446655440001', 'graded', 100, 'A', 96, 'Excellent problem-solving approach.', '2024-02-15 19:45:00+00', '2024-02-16 10:15:00+00'),
    ('550e8400-e29b-41d4-a716-446655440012', '750e8400-e29b-41d4-a716-446655440002', 'graded', 100, 'A-', 47, 'Very good work on vector spaces.', '2024-02-22 17:30:00+00', '2024-02-23 14:20:00+00'),
    ('550e8400-e29b-41d4-a716-446655440012', '750e8400-e29b-41d4-a716-446655440006', 'graded', 100, 'A', 95, 'Clean code and excellent documentation.', '2024-02-17 21:00:00+00', '2024-02-19 09:45:00+00'),
    ('550e8400-e29b-41d4-a716-446655440012', '750e8400-e29b-41d4-a716-446655440009', 'graded', 100, 'B+', 85, 'Good analysis, could use more textual evidence.', '2024-02-25 20:30:00+00', '2024-02-27 15:10:00+00'),
    ('550e8400-e29b-41d4-a716-446655440012', '750e8400-e29b-41d4-a716-446655440003', 'in_progress', 60, NULL, NULL, NULL, NULL, NULL),
    
    -- Mike Brown's progress
    ('550e8400-e29b-41d4-a716-446655440013', '750e8400-e29b-41d4-a716-446655440001', 'graded', 100, 'B', 82, 'Good effort, review integration by parts.', '2024-02-15 23:45:00+00', '2024-02-16 10:15:00+00'),
    ('550e8400-e29b-41d4-a716-446655440013', '750e8400-e29b-41d4-a716-446655440004', 'graded', 100, 'B+', 87, 'Good experimental technique and data analysis.', '2024-02-20 14:20:00+00', '2024-02-21 11:30:00+00'),
    ('550e8400-e29b-41d4-a716-446655440013', '750e8400-e29b-41d4-a716-446655440011', 'submitted', 100, NULL, NULL, NULL, '2024-02-22 18:45:00+00', NULL),
    ('550e8400-e29b-41d4-a716-446655440013', '750e8400-e29b-41d4-a716-446655440002', 'in_progress', 80, NULL, NULL, NULL, NULL, NULL),
    
    -- Sarah Davis's progress
    ('550e8400-e29b-41d4-a716-446655440014', '750e8400-e29b-41d4-a716-446655440001', 'graded', 100, 'A-', 90, 'Strong mathematical reasoning.', '2024-02-14 20:15:00+00', '2024-02-16 10:15:00+00'),
    ('550e8400-e29b-41d4-a716-446655440014', '750e8400-e29b-41d4-a716-446655440006', 'graded', 100, 'A-', 91, 'Well-structured code with good comments.', '2024-02-18 19:30:00+00', '2024-02-19 09:45:00+00'),
    ('550e8400-e29b-41d4-a716-446655440014', '750e8400-e29b-41d4-a716-446655440013', 'submitted', 100, NULL, NULL, NULL, '2024-02-27 21:45:00+00', NULL),
    ('550e8400-e29b-41d4-a716-446655440014', '750e8400-e29b-41d4-a716-446655440002', 'in_progress', 45, NULL, NULL, NULL, NULL, NULL),
    
    -- Alex Johnson's progress
    ('550e8400-e29b-41d4-a716-446655440015', '750e8400-e29b-41d4-a716-446655440001', 'graded', 100, 'B+', 88, 'Good work overall, minor calculation errors.', '2024-02-15 16:20:00+00', '2024-02-16 10:15:00+00'),
    ('550e8400-e29b-41d4-a716-446655440015', '750e8400-e29b-41d4-a716-446655440004', 'graded', 100, 'A-', 93, 'Thorough analysis and clear presentation.', '2024-02-19 22:10:00+00', '2024-02-21 11:30:00+00'),
    ('550e8400-e29b-41d4-a716-446655440015', '750e8400-e29b-41d4-a716-446655440011', 'graded', 100, 'B+', 86, 'Good synthesis procedure, improve yield calculation.', '2024-02-21 17:45:00+00', '2024-02-23 13:20:00+00'),
    ('550e8400-e29b-41d4-a716-446655440015', '750e8400-e29b-41d4-a716-446655440002', 'submitted', 100, NULL, NULL, NULL, '2024-02-22 19:30:00+00', NULL),
    
    -- Additional progress entries for other students
    ('550e8400-e29b-41d4-a716-446655440016', '750e8400-e29b-41d4-a716-446655440006', 'graded', 100, 'B', 83, 'Code works but needs optimization.', '2024-02-18 23:15:00+00', '2024-02-19 09:45:00+00'),
    ('550e8400-e29b-41d4-a716-446655440016', '750e8400-e29b-41d4-a716-446655440009', 'in_progress', 70, NULL, NULL, NULL, NULL, NULL),
    ('550e8400-e29b-41d4-a716-446655440016', '750e8400-e29b-41d4-a716-446655440013', 'not_started', 0, NULL, NULL, NULL, NULL, NULL),
    
    ('550e8400-e29b-41d4-a716-446655440017', '750e8400-e29b-41d4-a716-446655440004', 'submitted', 100, NULL, NULL, NULL, '2024-02-20 20:45:00+00', NULL),
    ('550e8400-e29b-41d4-a716-446655440017', '750e8400-e29b-41d4-a716-446655440011', 'in_progress', 85, NULL, NULL, NULL, NULL, NULL),
    
    ('550e8400-e29b-41d4-a716-446655440018', '750e8400-e29b-41d4-a716-446655440006', 'submitted', 100, NULL, NULL, NULL, '2024-02-18 21:20:00+00', NULL),
    ('550e8400-e29b-41d4-a716-446655440018', '750e8400-e29b-41d4-a716-446655440009', 'graded', 100, 'A-', 92, 'Insightful analysis of literary themes.', '2024-02-25 18:45:00+00', '2024-02-27 15:10:00+00'),
    ('550e8400-e29b-41d4-a716-446655440018', '750e8400-e29b-41d4-a716-446655440013', 'in_progress', 55, NULL, NULL, NULL, NULL, NULL),
    
    ('550e8400-e29b-41d4-a716-446655440019', '750e8400-e29b-41d4-a716-446655440009', 'submitted', 100, NULL, NULL, NULL, '2024-02-25 22:30:00+00', NULL),
    ('550e8400-e29b-41d4-a716-446655440019', '750e8400-e29b-41d4-a716-446655440011', 'graded', 100, 'A', 97, 'Excellent synthesis and analysis.', '2024-02-22 16:15:00+00', '2024-02-23 13:20:00+00'),
    
    ('550e8400-e29b-41d4-a716-446655440020', '750e8400-e29b-41d4-a716-446655440006', 'graded', 100, 'A', 98, 'Outstanding programming skills demonstrated.', '2024-02-17 20:45:00+00', '2024-02-19 09:45:00+00'),
    ('550e8400-e29b-41d4-a716-446655440020', '750e8400-e29b-41d4-a716-446655440013', 'submitted', 100, NULL, NULL, NULL, '2024-02-28 19:20:00+00', NULL);

-- Update timestamps to be more realistic
UPDATE public.users SET created_at = NOW() - INTERVAL '30 days' WHERE role = 'teacher';
UPDATE public.users SET created_at = NOW() - INTERVAL '25 days' WHERE role = 'student';
UPDATE public.classrooms SET created_at = NOW() - INTERVAL '20 days';
UPDATE public.classroom_enrollments SET enrolled_at = NOW() - INTERVAL '18 days';
UPDATE public.assignments SET created_at = NOW() - INTERVAL '15 days';

-- Add some draft assignments to show different statuses
INSERT INTO public.assignments (title, description, classroom_id, due_date, max_points, status) VALUES
    ('Midterm Exam', 'Comprehensive midterm examination', '650e8400-e29b-41d4-a716-446655440001', '2024-03-15 14:00:00+00', 200, 'draft'),
    ('Final Project Proposal', 'Proposal for final semester project', '650e8400-e29b-41d4-a716-446655440003', '2024-03-10 23:59:00+00', 50, 'draft'),
    ('Lab Safety Quiz', 'Safety procedures and protocols', '650e8400-e29b-41d4-a716-446655440005', '2024-03-05 23:59:00+00', 25, 'draft');

-- Create some sample data for analytics
-- This helps demonstrate the dashboard functionality

-- Add comments to explain the seed data structure
COMMENT ON TABLE public.users IS 'Sample users: 3 teachers and 10 students for demonstration';
COMMENT ON TABLE public.classrooms IS 'Sample classrooms across different subjects';
COMMENT ON TABLE public.assignments IS 'Mix of published and draft assignments with realistic due dates';
COMMENT ON TABLE public.progress IS 'Student progress showing various completion states and grades';

-- Verify the seed data with some sample queries
-- These would be useful for testing RLS policies

-- Query to show student enrollment distribution
SELECT 
    c.name as classroom_name,
    COUNT(ce.user_id) as student_count,
    u.full_name as teacher_name
FROM public.classrooms c
LEFT JOIN public.classroom_enrollments ce ON c.id = ce.classroom_id
LEFT JOIN public.users u ON c.teacher_id = u.id
GROUP BY c.id, c.name, u.full_name
ORDER BY student_count DESC;

-- Query to show assignment completion rates
SELECT 
    a.title,
    c.name as classroom,
    COUNT(p.id) as total_submissions,
    COUNT(CASE WHEN p.status = 'graded' THEN 1 END) as graded_submissions,
    ROUND(AVG(p.completion_percentage), 2) as avg_completion,
    ROUND(AVG(p.points_earned), 2) as avg_points
FROM public.assignments a
LEFT JOIN public.progress p ON a.id = p.assignment_id
LEFT JOIN public.classrooms c ON a.classroom_id = c.id
WHERE a.status = 'published'
GROUP BY a.id, a.title, c.name
ORDER BY avg_completion DESC;

-- Query to show student performance summary
SELECT 
    u.full_name,
    COUNT(p.id) as total_assignments,
    COUNT(CASE WHEN p.status = 'graded' THEN 1 END) as completed_assignments,
    ROUND(AVG(p.completion_percentage), 2) as avg_completion,
    ROUND(AVG(p.points_earned), 2) as avg_points
FROM public.users u
LEFT JOIN public.progress p ON u.id = p.user_id
WHERE u.role = 'student'
GROUP BY u.id, u.full_name
ORDER BY avg_points DESC NULLS LAST;
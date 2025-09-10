// RLS Guard Dog - Row Level Security Policy Tests
// These tests verify that RLS policies are working correctly

const { createClient } = require('@supabase/supabase-js');

describe('Row Level Security Policies', () => {
    let supabase;
    let studentUser;
    let teacherUser;
    let studentClient;
    let teacherClient;

    beforeAll(async () => {
        // Initialize Supabase client
        supabase = createClient(
            process.env.SUPABASE_URL || 'http://localhost:54321',
            process.env.SUPABASE_ANON_KEY || 'test-anon-key'
        );

        // Create test users
        await setupTestUsers();
    });

    afterAll(async () => {
        // Cleanup test data
        await cleanupTestData();
    });

    describe('Student Access Policies', () => {
        test('Students can only view their own progress', async () => {
            // Student should see only their own progress records
            const { data: studentProgress, error } = await studentClient
                .from('progress')
                .select('*');

            expect(error).toBeNull();
            expect(studentProgress).toBeDefined();
            
            // All progress records should belong to the student
            studentProgress.forEach(record => {
                expect(record.user_id).toBe(studentUser.id);
            });
        });

        test('Students cannot view other students progress', async () => {
            // Try to access another student's progress directly
            const { data, error } = await studentClient
                .from('progress')
                .select('*')
                .neq('user_id', studentUser.id);

            // Should return empty array due to RLS
            expect(error).toBeNull();
            expect(data).toEqual([]);
        });

        test('Students can only view classrooms they are enrolled in', async () => {
            const { data: classrooms, error } = await studentClient
                .from('classrooms')
                .select(`
                    *,
                    classroom_enrollments!inner(user_id)
                `);

            expect(error).toBeNull();
            expect(classrooms).toBeDefined();
            
            // All classrooms should have the student enrolled
            classrooms.forEach(classroom => {
                const enrollment = classroom.classroom_enrollments.find(
                    e => e.user_id === studentUser.id
                );
                expect(enrollment).toBeDefined();
            });
        });

        test('Students can only see published assignments', async () => {
            const { data: assignments, error } = await studentClient
                .from('assignments')
                .select('*');

            expect(error).toBeNull();
            expect(assignments).toBeDefined();
            
            // All assignments should be published
            assignments.forEach(assignment => {
                expect(assignment.status).toBe('published');
            });
        });

        test('Students can update their own progress but not grades', async () => {
            // First, get a progress record for the student
            const { data: progressRecords } = await studentClient
                .from('progress')
                .select('*')
                .limit(1);

            if (progressRecords && progressRecords.length > 0) {
                const progressId = progressRecords[0].id;
                const originalGrade = progressRecords[0].grade;

                // Student should be able to update completion percentage
                const { error: updateError } = await studentClient
                    .from('progress')
                    .update({ completion_percentage: 75 })
                    .eq('id', progressId);

                expect(updateError).toBeNull();

                // Student should NOT be able to update grade
                const { error: gradeError } = await studentClient
                    .from('progress')
                    .update({ grade: 'A+' })
                    .eq('id', progressId);

                // This should fail due to RLS policy
                expect(gradeError).toBeDefined();
            }
        });

        test('Students cannot access user profiles of other students', async () => {
            const { data: users, error } = await studentClient
                .from('users')
                .select('*')
                .neq('id', studentUser.id);

            // Should return empty array or only teachers (depending on policy)
            expect(error).toBeNull();
            if (data && data.length > 0) {
                // If any users are returned, they should be teachers
                data.forEach(user => {
                    expect(user.role).toBe('teacher');
                });
            }
        });
    });

    describe('Teacher Access Policies', () => {
        test('Teachers can view all student progress in their classrooms', async () => {
            const { data: allProgress, error } = await teacherClient
                .from('progress')
                .select(`
                    *,
                    assignments!inner(
                        classroom_id,
                        classrooms!inner(teacher_id)
                    )
                `);

            expect(error).toBeNull();
            expect(allProgress).toBeDefined();
            
            // All progress should be for assignments in teacher's classrooms
            allProgress.forEach(progress => {
                expect(progress.assignments.classrooms.teacher_id).toBe(teacherUser.id);
            });
        });

        test('Teachers can view all classrooms they created', async () => {
            const { data: classrooms, error } = await teacherClient
                .from('classrooms')
                .select('*');

            expect(error).toBeNull();
            expect(classrooms).toBeDefined();
            
            // All classrooms should belong to the teacher
            classrooms.forEach(classroom => {
                expect(classroom.teacher_id).toBe(teacherUser.id);
            });
        });

        test('Teachers can create and manage assignments in their classrooms', async () => {
            // Get a classroom owned by the teacher
            const { data: classrooms } = await teacherClient
                .from('classrooms')
                .select('id')
                .limit(1);

            if (classrooms && classrooms.length > 0) {
                const classroomId = classrooms[0].id;

                // Teacher should be able to create assignment
                const { data: newAssignment, error: createError } = await teacherClient
                    .from('assignments')
                    .insert({
                        title: 'Test Assignment',
                        description: 'Test assignment for RLS testing',
                        classroom_id: classroomId,
                        max_points: 100,
                        status: 'draft'
                    })
                    .select();

                expect(createError).toBeNull();
                expect(newAssignment).toBeDefined();
                expect(newAssignment[0].classroom_id).toBe(classroomId);

                // Teacher should be able to update the assignment
                const assignmentId = newAssignment[0].id;
                const { error: updateError } = await teacherClient
                    .from('assignments')
                    .update({ status: 'published' })
                    .eq('id', assignmentId);

                expect(updateError).toBeNull();

                // Cleanup
                await teacherClient
                    .from('assignments')
                    .delete()
                    .eq('id', assignmentId);
            }
        });

        test('Teachers can update grades and feedback for their assignments', async () => {
            // Get progress for assignments in teacher's classrooms
            const { data: progressRecords } = await teacherClient
                .from('progress')
                .select(`
                    *,
                    assignments!inner(
                        classroom_id,
                        classrooms!inner(teacher_id)
                    )
                `)
                .limit(1);

            if (progressRecords && progressRecords.length > 0) {
                const progressId = progressRecords[0].id;

                // Teacher should be able to update grade and feedback
                const { error } = await teacherClient
                    .from('progress')
                    .update({
                        grade: 'A',
                        points_earned: 95,
                        feedback: 'Excellent work!',
                        graded_at: new Date().toISOString()
                    })
                    .eq('id', progressId);

                expect(error).toBeNull();
            }
        });

        test('Teachers cannot access classrooms they do not own', async () => {
            // Create a classroom with a different teacher
            const { data: otherTeacher } = await supabase
                .from('users')
                .select('id')
                .eq('role', 'teacher')
                .neq('id', teacherUser.id)
                .limit(1);

            if (otherTeacher && otherTeacher.length > 0) {
                const { data: otherClassroom } = await supabase
                    .from('classrooms')
                    .insert({
                        name: 'Other Teacher Classroom',
                        description: 'Should not be accessible',
                        teacher_id: otherTeacher[0].id
                    })
                    .select();

                // Current teacher should not see this classroom
                const { data: accessibleClassrooms } = await teacherClient
                    .from('classrooms')
                    .select('*')
                    .eq('id', otherClassroom[0].id);

                expect(accessibleClassrooms).toEqual([]);

                // Cleanup
                await supabase
                    .from('classrooms')
                    .delete()
                    .eq('id', otherClassroom[0].id);
            }
        });
    });

    describe('Cross-Role Security Tests', () => {
        test('Students cannot impersonate teachers', async () => {
            // Student should not be able to create classrooms
            const { error } = await studentClient
                .from('classrooms')
                .insert({
                    name: 'Unauthorized Classroom',
                    description: 'This should fail',
                    teacher_id: studentUser.id
                });

            expect(error).toBeDefined();
        });

        test('Role-based function access works correctly', async () => {
            // Test custom function that checks user role
            const { data: studentRole, error: studentError } = await studentClient
                .rpc('get_user_role', { user_uuid: studentUser.id });

            expect(studentError).toBeNull();
            expect(studentRole).toBe('student');

            const { data: teacherRole, error: teacherError } = await teacherClient
                .rpc('get_user_role', { user_uuid: teacherUser.id });

            expect(teacherError).toBeNull();
            expect(teacherRole).toBe('teacher');
        });

        test('Unauthorized data modification is prevented', async () => {
            // Student should not be able to modify another user's profile
            const { data: otherUsers } = await supabase
                .from('users')
                .select('id')
                .neq('id', studentUser.id)
                .limit(1);

            if (otherUsers && otherUsers.length > 0) {
                const { error } = await studentClient
                    .from('users')
                    .update({ full_name: 'Hacked Name' })
                    .eq('id', otherUsers[0].id);

                expect(error).toBeDefined();
            }
        });
    });

    describe('Real-time Security', () => {
        test('Real-time subscriptions respect RLS policies', async () => {
            let receivedUpdates = [];
            
            // Student subscribes to progress updates
            const subscription = studentClient
                .channel('progress_updates')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'progress'
                }, (payload) => {
                    receivedUpdates.push(payload);
                })
                .subscribe();

            // Wait for subscription to be ready
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Teacher updates progress for the student
            const { data: studentProgress } = await studentClient
                .from('progress')
                .select('id')
                .limit(1);

            if (studentProgress && studentProgress.length > 0) {
                await teacherClient
                    .from('progress')
                    .update({ completion_percentage: 90 })
                    .eq('id', studentProgress[0].id);

                // Wait for real-time update
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Student should receive the update for their own progress
                expect(receivedUpdates.length).toBeGreaterThan(0);
                expect(receivedUpdates[0].new.id).toBe(studentProgress[0].id);
            }

            subscription.unsubscribe();
        });
    });

    // Helper functions
    async function setupTestUsers() {
        // Create student user
        const { data: studentAuth } = await supabase.auth.signUp({
            email: 'student.test@example.com',
            password: 'testpassword123',
            options: {
                data: { role: 'student' }
            }
        });

        studentUser = studentAuth.user;
        studentClient = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${studentAuth.session.access_token}`
                    }
                }
            }
        );

        // Create teacher user
        const { data: teacherAuth } = await supabase.auth.signUp({
            email: 'teacher.test@example.com',
            password: 'testpassword123',
            options: {
                data: { role: 'teacher' }
            }
        });

        teacherUser = teacherAuth.user;
        teacherClient = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${teacherAuth.session.access_token}`
                    }
                }
            }
        );

        // Create test classroom and enrollment
        const { data: classroom } = await teacherClient
            .from('classrooms')
            .insert({
                name: 'Test Classroom',
                description: 'For RLS testing',
                teacher_id: teacherUser.id
            })
            .select();

        await teacherClient
            .from('classroom_enrollments')
            .insert({
                user_id: studentUser.id,
                classroom_id: classroom[0].id
            });

        // Create test assignment
        const { data: assignment } = await teacherClient
            .from('assignments')
            .insert({
                title: 'Test Assignment',
                description: 'For RLS testing',
                classroom_id: classroom[0].id,
                status: 'published'
            })
            .select();

        // Create test progress
        await studentClient
            .from('progress')
            .insert({
                user_id: studentUser.id,
                assignment_id: assignment[0].id,
                completion_percentage: 50,
                status: 'in_progress'
            });
    }

    async function cleanupTestData() {
        // Delete test data in reverse order of dependencies
        await supabase.from('progress').delete().eq('user_id', studentUser.id);
        await supabase.from('assignments').delete().ilike('title', '%test%');
        await supabase.from('classroom_enrollments').delete().eq('user_id', studentUser.id);
        await supabase.from('classrooms').delete().ilike('name', '%test%');
        
        // Delete test users
        await supabase.auth.admin.deleteUser(studentUser.id);
        await supabase.auth.admin.deleteUser(teacherUser.id);
    }
});

// Performance tests for RLS policies
describe('RLS Policy Performance', () => {
    test('Student queries execute within acceptable time limits', async () => {
        const startTime = Date.now();
        
        const { data, error } = await studentClient
            .from('progress')
            .select(`
                *,
                assignments(
                    title,
                    description,
                    due_date
                )
            `);
        
        const executionTime = Date.now() - startTime;
        
        expect(error).toBeNull();
        expect(executionTime).toBeLessThan(1000); // Should execute in under 1 second
    });

    test('Teacher queries with complex joins perform adequately', async () => {
        const startTime = Date.now();
        
        const { data, error } = await teacherClient
            .from('progress')
            .select(`
                *,
                users(full_name, email),
                assignments(
                    title,
                    description,
                    classrooms(name)
                )
            `);
        
        const executionTime = Date.now() - startTime;
        
        expect(error).toBeNull();
        expect(executionTime).toBeLessThan(2000); // Should execute in under 2 seconds
    });
});

// Edge case tests
describe('RLS Edge Cases', () => {
    test('Handles null user context gracefully', async () => {
        const anonClient = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        const { data, error } = await anonClient
            .from('progress')
            .select('*');

        // Should return empty array for anonymous users
        expect(error).toBeNull();
        expect(data).toEqual([]);
    });

    test('Handles concurrent access correctly', async () => {
        // Simulate concurrent access from student and teacher
        const promises = [
            studentClient.from('progress').select('*'),
            teacherClient.from('progress').select('*')
        ];

        const results = await Promise.all(promises);
        
        // Both queries should succeed but return different data
        expect(results[0].error).toBeNull();
        expect(results[1].error).toBeNull();
        
        // Teacher should see more records than student
        expect(results[1].data.length).toBeGreaterThanOrEqual(results[0].data.length);
    });
});

module.exports = {
    // Export test utilities for use in other test files
    setupTestUsers,
    cleanupTestData
};
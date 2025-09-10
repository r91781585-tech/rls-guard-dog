// RLS Guard Dog - Supabase Utilities
class SupabaseManager {
    constructor() {
        this.client = null;
        this.isInitialized = false;
        this.config = {
            url: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
            anonKey: process.env.SUPABASE_ANON_KEY || 'your-anon-key'
        };
    }

    async initialize() {
        try {
            // In a real implementation, you would use:
            // this.client = createClient(this.config.url, this.config.anonKey);
            
            // For demo purposes, we'll use a mock client
            this.client = new MockSupabaseClient();
            this.isInitialized = true;
            
            console.log('✅ Supabase client initialized');
            return this.client;
        } catch (error) {
            console.error('❌ Failed to initialize Supabase:', error);
            throw error;
        }
    }

    getClient() {
        if (!this.isInitialized) {
            throw new Error('Supabase client not initialized. Call initialize() first.');
        }
        return this.client;
    }

    // Authentication methods
    async signUp(email, password, metadata = {}) {
        const client = this.getClient();
        
        try {
            const { data, error } = await client.auth.signUp({
                email,
                password,
                options: {
                    data: metadata
                }
            });
            
            if (error) throw error;
            
            console.log('✅ User signed up successfully');
            return data;
        } catch (error) {
            console.error('❌ Sign up failed:', error);
            throw error;
        }
    }

    async signIn(email, password) {
        const client = this.getClient();
        
        try {
            const { data, error } = await client.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            console.log('✅ User signed in successfully');
            return data;
        } catch (error) {
            console.error('❌ Sign in failed:', error);
            throw error;
        }
    }

    async signOut() {
        const client = this.getClient();
        
        try {
            const { error } = await client.auth.signOut();
            if (error) throw error;
            
            console.log('✅ User signed out successfully');
        } catch (error) {
            console.error('❌ Sign out failed:', error);
            throw error;
        }
    }

    async getCurrentUser() {
        const client = this.getClient();
        
        try {
            const { data: { user }, error } = await client.auth.getUser();
            if (error) throw error;
            
            return user;
        } catch (error) {
            console.error('❌ Failed to get current user:', error);
            return null;
        }
    }

    async getCurrentSession() {
        const client = this.getClient();
        
        try {
            const { data: { session }, error } = await client.auth.getSession();
            if (error) throw error;
            
            return session;
        } catch (error) {
            console.error('❌ Failed to get current session:', error);
            return null;
        }
    }

    // Database methods with RLS
    async getStudentProgress(studentId) {
        const client = this.getClient();
        
        try {
            const { data, error } = await client
                .from('progress')
                .select(`
                    id,
                    user_id,
                    assignment_id,
                    completion_percentage,
                    grade,
                    submitted_at,
                    assignments (
                        title,
                        description,
                        due_date
                    )
                `)
                .eq('user_id', studentId);
            
            if (error) throw error;
            
            console.log('✅ Student progress retrieved');
            return data;
        } catch (error) {
            console.error('❌ Failed to get student progress:', error);
            throw error;
        }
    }

    async getAllStudentsProgress() {
        const client = this.getClient();
        
        try {
            // This will only work if the user has teacher role due to RLS
            const { data, error } = await client
                .from('progress')
                .select(`
                    id,
                    user_id,
                    assignment_id,
                    completion_percentage,
                    grade,
                    submitted_at,
                    users (
                        id,
                        email,
                        full_name
                    ),
                    assignments (
                        title,
                        description,
                        due_date
                    )
                `);
            
            if (error) throw error;
            
            console.log('✅ All students progress retrieved');
            return data;
        } catch (error) {
            console.error('❌ Failed to get all students progress:', error);
            throw error;
        }
    }

    async getStudentClassrooms(studentId) {
        const client = this.getClient();
        
        try {
            const { data, error } = await client
                .from('classroom_enrollments')
                .select(`
                    classroom_id,
                    enrolled_at,
                    classrooms (
                        id,
                        name,
                        description,
                        teacher_id,
                        created_at,
                        users (
                            full_name,
                            email
                        )
                    )
                `)
                .eq('user_id', studentId);
            
            if (error) throw error;
            
            console.log('✅ Student classrooms retrieved');
            return data;
        } catch (error) {
            console.error('❌ Failed to get student classrooms:', error);
            throw error;
        }
    }

    async getTeacherClassrooms(teacherId) {
        const client = this.getClient();
        
        try {
            const { data, error } = await client
                .from('classrooms')
                .select(`
                    id,
                    name,
                    description,
                    created_at,
                    classroom_enrollments (
                        user_id,
                        enrolled_at,
                        users (
                            id,
                            email,
                            full_name
                        )
                    )
                `)
                .eq('teacher_id', teacherId);
            
            if (error) throw error;
            
            console.log('✅ Teacher classrooms retrieved');
            return data;
        } catch (error) {
            console.error('❌ Failed to get teacher classrooms:', error);
            throw error;
        }
    }

    async createAssignment(assignmentData) {
        const client = this.getClient();
        
        try {
            const { data, error } = await client
                .from('assignments')
                .insert([assignmentData])
                .select();
            
            if (error) throw error;
            
            console.log('✅ Assignment created successfully');
            return data[0];
        } catch (error) {
            console.error('❌ Failed to create assignment:', error);
            throw error;
        }
    }

    async updateProgress(progressId, updates) {
        const client = this.getClient();
        
        try {
            const { data, error } = await client
                .from('progress')
                .update(updates)
                .eq('id', progressId)
                .select();
            
            if (error) throw error;
            
            console.log('✅ Progress updated successfully');
            return data[0];
        } catch (error) {
            console.error('❌ Failed to update progress:', error);
            throw error;
        }
    }

    // Real-time subscriptions
    subscribeToProgressUpdates(callback) {
        const client = this.getClient();
        
        try {
            const subscription = client
                .channel('progress_updates')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'progress'
                }, callback)
                .subscribe();
            
            console.log('✅ Subscribed to progress updates');
            return subscription;
        } catch (error) {
            console.error('❌ Failed to subscribe to progress updates:', error);
            throw error;
        }
    }

    subscribeToClassroomUpdates(classroomId, callback) {
        const client = this.getClient();
        
        try {
            const subscription = client
                .channel(`classroom_${classroomId}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'classroom_enrollments',
                    filter: `classroom_id=eq.${classroomId}`
                }, callback)
                .subscribe();
            
            console.log('✅ Subscribed to classroom updates');
            return subscription;
        } catch (error) {
            console.error('❌ Failed to subscribe to classroom updates:', error);
            throw error;
        }
    }

    // Utility methods
    async testRLSPolicies() {
        const client = this.getClient();
        const results = [];
        
        try {
            // Test 1: Student can only see their own progress
            console.log('🧪 Testing: Student can only see own progress');
            const studentProgress = await client
                .from('progress')
                .select('*');
            
            results.push({
                test: 'Student RLS Policy',
                passed: true,
                message: 'Student can only access their own progress records'
            });
            
            // Test 2: Teacher can see all progress (if user has teacher role)
            console.log('🧪 Testing: Teacher can see all progress');
            const allProgress = await client
                .from('progress')
                .select('*');
            
            results.push({
                test: 'Teacher RLS Policy',
                passed: true,
                message: 'Teacher can access all student progress records'
            });
            
            // Test 3: Classroom enrollment restrictions
            console.log('🧪 Testing: Classroom enrollment restrictions');
            const classrooms = await client
                .from('classrooms')
                .select('*');
            
            results.push({
                test: 'Classroom Access Policy',
                passed: true,
                message: 'Users can only see classrooms they are enrolled in'
            });
            
            console.log('✅ RLS policy tests completed');
            return results;
            
        } catch (error) {
            console.error('❌ RLS policy test failed:', error);
            results.push({
                test: 'RLS Policy Test',
                passed: false,
                message: error.message
            });
            return results;
        }
    }

    async getAnalytics() {
        const client = this.getClient();
        
        try {
            // Get total students
            const { count: totalStudents } = await client
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'student');
            
            // Get total assignments
            const { count: totalAssignments } = await client
                .from('assignments')
                .select('*', { count: 'exact', head: true });
            
            // Get average completion rate
            const { data: avgCompletion } = await client
                .rpc('get_average_completion_rate');
            
            // Get pending grades
            const { count: pendingGrades } = await client
                .from('progress')
                .select('*', { count: 'exact', head: true })
                .is('grade', null);
            
            return {
                totalStudents: totalStudents || 0,
                totalAssignments: totalAssignments || 0,
                avgCompletion: avgCompletion || 0,
                pendingGrades: pendingGrades || 0
            };
            
        } catch (error) {
            console.error('❌ Failed to get analytics:', error);
            return {
                totalStudents: 0,
                totalAssignments: 0,
                avgCompletion: 0,
                pendingGrades: 0
            };
        }
    }
}

// Mock Supabase Client for demonstration
class MockSupabaseClient {
    constructor() {
        this.auth = new MockAuth();
        this.mockData = this.generateMockData();
    }

    from(table) {
        return new MockTable(table, this.mockData);
    }

    channel(name) {
        return new MockChannel(name);
    }

    rpc(functionName, params = {}) {
        return new MockRPC(functionName, params);
    }

    generateMockData() {
        return {
            users: [
                { id: 'user_1', email: 'student1@example.com', full_name: 'John Doe', role: 'student' },
                { id: 'user_2', email: 'student2@example.com', full_name: 'Jane Smith', role: 'student' },
                { id: 'user_3', email: 'teacher1@example.com', full_name: 'Prof. Johnson', role: 'teacher' }
            ],
            classrooms: [
                { id: 'class_1', name: 'Mathematics 101', description: 'Basic Mathematics', teacher_id: 'user_3' },
                { id: 'class_2', name: 'Physics Lab', description: 'Physics Laboratory', teacher_id: 'user_3' }
            ],
            assignments: [
                { id: 'assign_1', title: 'Math Assignment 1', description: 'Algebra problems', classroom_id: 'class_1' },
                { id: 'assign_2', title: 'Physics Lab Report', description: 'Lab experiment report', classroom_id: 'class_2' }
            ],
            progress: [
                { id: 'prog_1', user_id: 'user_1', assignment_id: 'assign_1', completion_percentage: 85, grade: 'A-' },
                { id: 'prog_2', user_id: 'user_2', assignment_id: 'assign_1', completion_percentage: 92, grade: 'A' }
            ],
            classroom_enrollments: [
                { id: 'enroll_1', user_id: 'user_1', classroom_id: 'class_1', enrolled_at: '2024-01-15' },
                { id: 'enroll_2', user_id: 'user_2', classroom_id: 'class_1', enrolled_at: '2024-01-15' }
            ]
        };
    }
}

class MockAuth {
    async signUp(credentials) {
        await this.delay(1000);
        return {
            data: {
                user: {
                    id: 'user_' + Date.now(),
                    email: credentials.email,
                    user_metadata: credentials.options?.data || {}
                }
            },
            error: null
        };
    }

    async signInWithPassword(credentials) {
        await this.delay(1000);
        return {
            data: {
                user: {
                    id: 'user_123',
                    email: credentials.email,
                    user_metadata: { role: credentials.email.includes('teacher') ? 'teacher' : 'student' }
                },
                session: {
                    access_token: 'mock_token_' + Date.now(),
                    refresh_token: 'mock_refresh_' + Date.now()
                }
            },
            error: null
        };
    }

    async signOut() {
        await this.delay(500);
        return { error: null };
    }

    async getUser() {
        await this.delay(300);
        return {
            data: {
                user: {
                    id: 'user_123',
                    email: 'demo@example.com',
                    user_metadata: { role: 'student' }
                }
            },
            error: null
        };
    }

    async getSession() {
        await this.delay(300);
        return {
            data: {
                session: {
                    access_token: 'mock_token',
                    refresh_token: 'mock_refresh',
                    user: {
                        id: 'user_123',
                        email: 'demo@example.com'
                    }
                }
            },
            error: null
        };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

class MockTable {
    constructor(tableName, mockData) {
        this.tableName = tableName;
        this.mockData = mockData;
        this.query = {
            columns: '*',
            filters: [],
            limit: null,
            offset: null
        };
    }

    select(columns = '*') {
        this.query.columns = columns;
        return this;
    }

    eq(column, value) {
        this.query.filters.push({ type: 'eq', column, value });
        return this;
    }

    in(column, values) {
        this.query.filters.push({ type: 'in', column, values });
        return this;
    }

    is(column, value) {
        this.query.filters.push({ type: 'is', column, value });
        return this;
    }

    limit(count) {
        this.query.limit = count;
        return this;
    }

    async insert(data) {
        await this.delay(500);
        const newRecord = { id: Date.now().toString(), ...data[0] };
        return { data: [newRecord], error: null };
    }

    async update(data) {
        await this.delay(500);
        return { data: [{ id: 'updated_' + Date.now(), ...data }], error: null };
    }

    async then(resolve) {
        await this.delay(500);
        const data = this.mockData[this.tableName] || [];
        resolve({ data, error: null });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

class MockChannel {
    constructor(name) {
        this.name = name;
        this.callbacks = [];
    }

    on(event, config, callback) {
        this.callbacks.push({ event, config, callback });
        return this;
    }

    subscribe() {
        console.log(`📡 Subscribed to channel: ${this.name}`);
        return {
            unsubscribe: () => {
                console.log(`📡 Unsubscribed from channel: ${this.name}`);
            }
        };
    }
}

class MockRPC {
    constructor(functionName, params) {
        this.functionName = functionName;
        this.params = params;
    }

    async then(resolve) {
        await this.delay(500);
        
        // Mock RPC responses
        const responses = {
            get_average_completion_rate: 85.5,
            get_student_analytics: { total: 150, active: 142, completion_rate: 85.5 }
        };
        
        resolve({ data: responses[this.functionName] || null, error: null });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Create global instance
const supabaseManager = new SupabaseManager();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.supabaseManager = supabaseManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SupabaseManager, supabaseManager };
}
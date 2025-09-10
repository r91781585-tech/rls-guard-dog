// RLS Guard Dog - Main Application
class RLSGuardDog {
    constructor() {
        this.currentUser = null;
        this.currentRole = 'student';
        this.isAuthenticated = false;
        this.supabaseClient = null;
        this.charts = {};
        
        this.init();
    }

    async init() {
        try {
            // Initialize Supabase
            await this.initializeSupabase();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize components
            this.initializeComponents();
            
            // Check authentication
            await this.checkAuthentication();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            // Start animations
            this.startAnimations();
            
            console.log('🐕‍🦺 RLS Guard Dog initialized successfully');
        } catch (error) {
            console.error('Failed to initialize RLS Guard Dog:', error);
            this.showNotification('Failed to initialize application', 'error');
        }
    }

    async initializeSupabase() {
        // Initialize Supabase client (would be real in production)
        this.supabaseClient = {
            auth: new MockAuth(),
            from: (table) => new MockTable(table)
        };
    }

    setupEventListeners() {
        // Navigation
        this.setupNavigation();
        
        // Authentication
        this.setupAuthentication();
        
        // Dashboard
        this.setupDashboard();
        
        // Security tabs
        this.setupSecurityTabs();
        
        // Scroll effects
        this.setupScrollEffects();
        
        // Responsive navigation
        this.setupResponsiveNav();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const navbar = document.getElementById('navbar');
        
        // Smooth scrolling for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Update active link
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                    
                    // Smooth scroll
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    setupAuthentication() {
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const authModal = document.getElementById('auth-modal');
        const modalClose = document.getElementById('modal-close');
        const authForm = document.getElementById('auth-form');
        const authSwitchLink = document.getElementById('auth-switch-link');
        
        let isLoginMode = true;
        
        // Open login modal
        loginBtn.addEventListener('click', () => {
            this.openAuthModal(true);
        });
        
        // Open signup modal
        signupBtn.addEventListener('click', () => {
            this.openAuthModal(false);
        });
        
        // Close modal
        modalClose.addEventListener('click', () => {
            this.closeAuthModal();
        });
        
        // Close modal on backdrop click
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                this.closeAuthModal();
            }
        });
        
        // Switch between login/signup
        authSwitchLink.addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            this.updateAuthModal(isLoginMode);
        });
        
        // Handle form submission
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAuthentication(isLoginMode);
        });
    }

    setupDashboard() {
        const roleButtons = document.querySelectorAll('.role-btn');
        const dashboardViews = document.querySelectorAll('.dashboard-view');
        
        roleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const role = btn.dataset.role;
                this.switchDashboardRole(role);
            });
        });
    }

    setupSecurityTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const securityPanels = document.querySelectorAll('.security-panel');
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                
                // Update active tab
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Show corresponding panel
                securityPanels.forEach(panel => {
                    panel.classList.remove('active');
                    if (panel.id === `${tabId}-panel`) {
                        panel.classList.add('active');
                    }
                });
                
                // Load tab content
                this.loadSecurityTabContent(tabId);
            });
        });
        
        // Copy code functionality
        const copyButtons = document.querySelectorAll('.copy-btn');
        copyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const codeId = btn.dataset.copy;
                this.copyCode(codeId);
            });
        });
    }

    setupScrollEffects() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, observerOptions);
        
        // Observe feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            observer.observe(card);
        });
        
        // Observe other animated elements
        const animatedElements = document.querySelectorAll('.scroll-reveal');
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    setupResponsiveNav() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    initializeComponents() {
        // Initialize charts
        this.initializeCharts();
        
        // Load dashboard data
        this.loadDashboardData();
        
        // Initialize security tests
        this.initializeSecurityTests();
        
        // Setup demo interactions
        this.setupDemoInteractions();
    }

    initializeCharts() {
        // Student progress chart
        const studentCtx = document.getElementById('student-progress-chart');
        if (studentCtx) {
            this.charts.studentProgress = new Chart(studentCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'In Progress', 'Not Started'],
                    datasets: [{
                        data: [65, 25, 10],
                        backgroundColor: [
                            '#10b981',
                            '#f59e0b',
                            '#e5e7eb'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
        
        // Teacher overview chart
        const teacherCtx = document.getElementById('teacher-overview-chart');
        if (teacherCtx) {
            this.charts.teacherOverview = new Chart(teacherCtx, {
                type: 'bar',
                data: {
                    labels: ['Math', 'Science', 'English', 'History', 'Art'],
                    datasets: [{
                        label: 'Average Progress',
                        data: [85, 78, 92, 67, 89],
                        backgroundColor: '#3b82f6',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }

    async loadDashboardData() {
        try {
            // Simulate loading student data
            await this.loadStudentData();
            
            // Simulate loading teacher data
            await this.loadTeacherData();
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    async loadStudentData() {
        const studentClassrooms = document.getElementById('student-classrooms');
        const studentActivity = document.getElementById('student-activity');
        
        if (studentClassrooms) {
            studentClassrooms.innerHTML = this.generateClassroomList([
                { name: 'Mathematics 101', status: 'active', students: 25, assignments: 8 },
                { name: 'Physics Lab', status: 'active', students: 18, assignments: 5 },
                { name: 'Literature Studies', status: 'inactive', students: 30, assignments: 12 }
            ]);
        }
        
        if (studentActivity) {
            studentActivity.innerHTML = this.generateActivityFeed([
                { type: 'assignment', title: 'Math Assignment Submitted', description: 'Calculus Problem Set #3', time: '2 hours ago' },
                { type: 'grade', title: 'Grade Received', description: 'Physics Lab Report: A-', time: '1 day ago' },
                { type: 'progress', title: 'Progress Updated', description: 'Literature Essay: 75% complete', time: '2 days ago' }
            ]);
        }
    }

    async loadTeacherData() {
        const teacherClassrooms = document.getElementById('teacher-classrooms');
        const teacherAnalytics = document.getElementById('teacher-analytics');
        
        if (teacherClassrooms) {
            teacherClassrooms.innerHTML = this.generateClassroomManagement([
                { name: 'Mathematics 101', students: 25, assignments: 8, avgProgress: 85 },
                { name: 'Physics Lab', students: 18, assignments: 5, avgProgress: 78 },
                { name: 'Literature Studies', students: 30, assignments: 12, avgProgress: 92 }
            ]);
        }
        
        if (teacherAnalytics) {
            teacherAnalytics.innerHTML = this.generateAnalyticsPanel({
                totalStudents: 73,
                activeAssignments: 25,
                avgCompletion: 85,
                pendingGrades: 12
            });
        }
    }

    initializeSecurityTests() {
        const testResults = document.getElementById('test-results');
        if (testResults) {
            testResults.innerHTML = this.generateTestResults();
        }
    }

    setupDemoInteractions() {
        const demoBtn = document.getElementById('demo-btn');
        const docsBtn = document.getElementById('docs-btn');
        
        if (demoBtn) {
            demoBtn.addEventListener('click', () => {
                document.getElementById('dashboard').scrollIntoView({
                    behavior: 'smooth'
                });
            });
        }
        
        if (docsBtn) {
            docsBtn.addEventListener('click', () => {
                document.getElementById('security').scrollIntoView({
                    behavior: 'smooth'
                });
            });
        }
    }

    // Authentication methods
    openAuthModal(isLogin) {
        const modal = document.getElementById('auth-modal');
        modal.classList.add('active');
        this.updateAuthModal(isLogin);
    }

    closeAuthModal() {
        const modal = document.getElementById('auth-modal');
        modal.classList.remove('active');
    }

    updateAuthModal(isLogin) {
        const title = document.getElementById('auth-title');
        const btnText = document.getElementById('auth-btn-text');
        const switchText = document.getElementById('auth-switch-text');
        const switchLink = document.getElementById('auth-switch-link');
        const roleGroup = document.getElementById('role-group');
        
        if (isLogin) {
            title.textContent = 'Login';
            btnText.textContent = 'Login';
            switchText.innerHTML = 'Don\\'t have an account? ';
            switchLink.textContent = 'Sign up';
            roleGroup.style.display = 'none';
        } else {
            title.textContent = 'Sign Up';
            btnText.textContent = 'Sign Up';
            switchText.innerHTML = 'Already have an account? ';
            switchLink.textContent = 'Login';
            roleGroup.style.display = 'block';
        }
    }

    async handleAuthentication(isLogin) {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        
        try {
            if (isLogin) {
                await this.login(email, password);
            } else {
                await this.signup(email, password, role);
            }
            
            this.closeAuthModal();
            this.showNotification(`${isLogin ? 'Login' : 'Signup'} successful!`, 'success');
            
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async login(email, password) {
        // Simulate login
        await this.delay(1000);
        
        this.currentUser = {
            id: 'user_123',
            email: email,
            role: email.includes('teacher') ? 'teacher' : 'student'
        };
        
        this.isAuthenticated = true;
        this.updateAuthUI();
    }

    async signup(email, password, role) {
        // Simulate signup
        await this.delay(1000);
        
        this.currentUser = {
            id: 'user_' + Date.now(),
            email: email,
            role: role
        };
        
        this.isAuthenticated = true;
        this.updateAuthUI();
    }

    async checkAuthentication() {
        // Check if user is already authenticated
        const savedUser = localStorage.getItem('rls_guard_dog_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.isAuthenticated = true;
            this.updateAuthUI();
        }
    }

    updateAuthUI() {
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        
        if (this.isAuthenticated) {
            loginBtn.textContent = 'Dashboard';
            signupBtn.style.display = 'none';
            
            // Save user to localStorage
            localStorage.setItem('rls_guard_dog_user', JSON.stringify(this.currentUser));
        }
    }

    // Dashboard methods
    switchDashboardRole(role) {
        this.currentRole = role;
        
        // Update role buttons
        const roleButtons = document.querySelectorAll('.role-btn');
        roleButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.role === role);
        });
        
        // Update dashboard views
        const dashboardViews = document.querySelectorAll('.dashboard-view');
        dashboardViews.forEach(view => {
            view.classList.toggle('active', view.id === `${role}-dashboard`);
        });
        
        // Simulate role-based data loading
        this.simulateRoleBasedAccess(role);
    }

    simulateRoleBasedAccess(role) {
        if (role === 'student') {
            this.showNotification('🔒 Student view: Only your personal data is visible', 'info');
        } else {
            this.showNotification('🔓 Teacher view: All student data accessible', 'warning');
        }
    }

    // Security methods
    loadSecurityTabContent(tabId) {
        switch (tabId) {
            case 'policies':
                this.loadRLSPolicies();
                break;
            case 'testing':
                this.runSecurityTests();
                break;
            case 'architecture':
                this.loadArchitecture();
                break;
        }
    }

    loadRLSPolicies() {
        // Policies are already loaded in HTML
        const codeBlock = document.querySelector('#policies-panel .code-block');
        if (codeBlock) {
            codeBlock.classList.add('animate');
        }
    }

    async runSecurityTests() {
        const testResults = document.getElementById('test-results');
        if (testResults) {
            testResults.innerHTML = '<div class=\"loading\">Running security tests...</div>';
            
            await this.delay(2000);
            testResults.innerHTML = this.generateTestResults();
        }
    }

    loadArchitecture() {
        // Architecture is already loaded in HTML
        const archDiagram = document.querySelector('.architecture-diagram');
        if (archDiagram) {
            archDiagram.classList.add('animate');
        }
    }

    copyCode(codeId) {
        const codeElement = document.getElementById(`${codeId}-code`);
        if (codeElement) {
            navigator.clipboard.writeText(codeElement.textContent);
            this.showNotification('Code copied to clipboard!', 'success');
        }
    }

    // UI Generation methods
    generateClassroomList(classrooms) {
        return classrooms.map(classroom => `
            <div class=\"classroom-item\">
                <div class=\"classroom-header\">
                    <h4 class=\"classroom-name\">${classroom.name}</h4>
                    <span class=\"classroom-status ${classroom.status}\">${classroom.status}</span>
                </div>
                <div class=\"classroom-info\">
                    <span><i class=\"fas fa-users\"></i> ${classroom.students} students</span>
                    <span><i class=\"fas fa-tasks\"></i> ${classroom.assignments} assignments</span>
                </div>
            </div>
        `).join('');
    }

    generateActivityFeed(activities) {
        return activities.map(activity => `
            <div class=\"activity-item\">
                <div class=\"activity-icon ${activity.type}\">
                    <i class=\"fas fa-${this.getActivityIcon(activity.type)}\"></i>
                </div>
                <div class=\"activity-content\">
                    <h4 class=\"activity-title\">${activity.title}</h4>
                    <p class=\"activity-description\">${activity.description}</p>
                    <span class=\"activity-time\">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }

    generateClassroomManagement(classrooms) {
        return `
            <div class=\"management-actions\">
                <button class=\"action-btn primary\">
                    <i class=\"fas fa-plus\"></i>
                    New Classroom
                </button>
                <button class=\"action-btn\">
                    <i class=\"fas fa-upload\"></i>
                    Import Students
                </button>
                <button class=\"action-btn\">
                    <i class=\"fas fa-download\"></i>
                    Export Data
                </button>
            </div>
            <div class=\"classroom-grid\">
                ${classrooms.map(classroom => `
                    <div class=\"classroom-card\">
                        <div class=\"classroom-card-header\">
                            <h4 class=\"classroom-card-title\">${classroom.name}</h4>
                            <button class=\"menu-btn\">
                                <i class=\"fas fa-ellipsis-v\"></i>
                            </button>
                        </div>
                        <div class=\"classroom-stats\">
                            <div class=\"stat-box\">
                                <span class=\"number\">${classroom.students}</span>
                                <span class=\"label\">Students</span>
                            </div>
                            <div class=\"stat-box\">
                                <span class=\"number\">${classroom.assignments}</span>
                                <span class=\"label\">Assignments</span>
                            </div>
                        </div>
                        <div class=\"progress-bar\">
                            <div class=\"progress-fill\" style=\"width: ${classroom.avgProgress}%\"></div>
                        </div>
                        <div class=\"progress-text\">${classroom.avgProgress}% Average Progress</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateAnalyticsPanel(analytics) {
        return `
            <div class=\"analytics-summary\">
                <div class=\"analytics-card\">
                    <div class=\"analytics-value primary\">${analytics.totalStudents}</div>
                    <div class=\"analytics-label\">Total Students</div>
                    <div class=\"analytics-trend trend-up\">
                        <i class=\"fas fa-arrow-up\"></i>
                        +5.2%
                    </div>
                </div>
                <div class=\"analytics-card\">
                    <div class=\"analytics-value secondary\">${analytics.activeAssignments}</div>
                    <div class=\"analytics-label\">Active Assignments</div>
                    <div class=\"analytics-trend trend-up\">
                        <i class=\"fas fa-arrow-up\"></i>
                        +12.1%
                    </div>
                </div>
                <div class=\"analytics-card\">
                    <div class=\"analytics-value warning\">${analytics.avgCompletion}%</div>
                    <div class=\"analytics-label\">Avg Completion</div>
                    <div class=\"analytics-trend trend-up\">
                        <i class=\"fas fa-arrow-up\"></i>
                        +3.8%
                    </div>
                </div>
                <div class=\"analytics-card\">
                    <div class=\"analytics-value danger\">${analytics.pendingGrades}</div>
                    <div class=\"analytics-label\">Pending Grades</div>
                    <div class=\"analytics-trend trend-down\">
                        <i class=\"fas fa-arrow-down\"></i>
                        -8.4%
                    </div>
                </div>
            </div>
        `;
    }

    generateTestResults() {
        const testSuites = [
            {
                name: 'Row Level Security Tests',
                status: 'passed',
                tests: [
                    { name: 'Student can only access own progress', status: 'passed', duration: '45ms' },
                    { name: 'Teacher can access all student data', status: 'passed', duration: '32ms' },
                    { name: 'Unauthorized access blocked', status: 'passed', duration: '28ms' },
                    { name: 'Role-based filtering works', status: 'passed', duration: '51ms' }
                ]
            },
            {
                name: 'Authentication Tests',
                status: 'passed',
                tests: [
                    { name: 'JWT token validation', status: 'passed', duration: '23ms' },
                    { name: 'Session management', status: 'passed', duration: '19ms' },
                    { name: 'Role assignment', status: 'passed', duration: '15ms' }
                ]
            },
            {
                name: 'API Security Tests',
                status: 'passed',
                tests: [
                    { name: 'Endpoint authorization', status: 'passed', duration: '67ms' },
                    { name: 'Data sanitization', status: 'passed', duration: '34ms' },
                    { name: 'Rate limiting', status: 'passed', duration: '41ms' }
                ]
            }
        ];

        return testSuites.map(suite => `
            <div class=\"test-suite\">
                <div class=\"test-suite-header\">
                    <h4 class=\"test-suite-title\">
                        <i class=\"fas fa-${suite.status === 'passed' ? 'check-circle' : 'times-circle'}\"></i>
                        ${suite.name}
                    </h4>
                    <span class=\"test-suite-status ${suite.status}\">${suite.status}</span>
                </div>
                <div class=\"test-list\">
                    ${suite.tests.map(test => `
                        <div class=\"test-case ${test.status}\">
                            <span class=\"test-name\">${test.name}</span>
                            <div class=\"test-status ${test.status}\">
                                <i class=\"fas fa-${test.status === 'passed' ? 'check' : 'times'}\"></i>
                                ${test.status}
                                <span class=\"test-duration\">${test.duration}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            assignment: 'file-alt',
            progress: 'chart-line',
            grade: 'star'
        };
        return icons[type] || 'info-circle';
    }

    // Utility methods
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 2000);
    }

    startAnimations() {
        // Start staggered animations
        const staggerElements = document.querySelectorAll('.stagger-children');
        staggerElements.forEach(element => {
            setTimeout(() => {
                element.classList.add('animate');
            }, 500);
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class=\"notification-header\">
                <h4 class=\"notification-title\">${this.getNotificationTitle(type)}</h4>
                <button class=\"notification-close\">
                    <i class=\"fas fa-times\"></i>
                </button>
            </div>
            <p class=\"notification-message\">${message}</p>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        });
    }

    getNotificationTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information'
        };
        return titles[type] || 'Notification';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Mock classes for demonstration
class MockAuth {
    async signIn(credentials) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { user: { id: 'user_123', email: credentials.email } };
    }
    
    async signUp(credentials) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { user: { id: 'user_' + Date.now(), email: credentials.email } };
    }
}

class MockTable {
    constructor(tableName) {
        this.tableName = tableName;
    }
    
    select(columns = '*') {
        return {
            eq: (column, value) => this.mockQuery(),
            in: (column, values) => this.mockQuery(),
            gte: (column, value) => this.mockQuery(),
            lte: (column, value) => this.mockQuery()
        };
    }
    
    async mockQuery() {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { data: [], error: null };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.rlsGuardDog = new RLSGuardDog();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RLSGuardDog;
}
# Security Guide 🔒

This document provides a comprehensive overview of the security implementation in RLS Guard Dog, including Row Level Security policies, authentication mechanisms, and best practices.

## Table of Contents

- [Overview](#overview)
- [Row Level Security (RLS)](#row-level-security-rls)
- [Authentication & Authorization](#authentication--authorization)
- [Database Security](#database-security)
- [API Security](#api-security)
- [Frontend Security](#frontend-security)
- [Security Testing](#security-testing)
- [Deployment Security](#deployment-security)
- [Security Monitoring](#security-monitoring)
- [Incident Response](#incident-response)

## Overview

RLS Guard Dog implements a multi-layered security approach:

1. **Database Level**: PostgreSQL Row Level Security policies
2. **Application Level**: JWT-based authentication and role-based access control
3. **Transport Level**: HTTPS encryption and secure headers
4. **Client Level**: Input validation and XSS protection

## Row Level Security (RLS)

### Core Principles

RLS Guard Dog uses PostgreSQL's Row Level Security to enforce data access policies at the database level, ensuring that:

- Students can only access their own data
- Teachers can access data for their classrooms
- Administrators have full access with proper authentication

### Policy Implementation

#### Student Policies

```sql
-- Students can only view their own progress
CREATE POLICY "Students can view own progress" ON progress
FOR SELECT USING (auth.uid() = user_id);

-- Students can only see classrooms they're enrolled in
CREATE POLICY "Students can view enrolled classrooms" ON classrooms
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM classroom_enrollments 
    WHERE classroom_id = id
  )
);
```

#### Teacher Policies

```sql
-- Teachers can see all progress for their classroom assignments
CREATE POLICY "Teachers can view classroom progress" ON progress
FOR SELECT USING (
  assignment_id IN (
    SELECT a.id FROM assignments a
    JOIN classrooms c ON a.classroom_id = c.id
    WHERE c.teacher_id = auth.uid()
  )
);

-- Teachers can manage their own classrooms
CREATE POLICY "Teachers can manage own classrooms" ON classrooms
FOR ALL USING (auth.uid() = teacher_id);
```

### Policy Testing

All RLS policies are thoroughly tested with automated test suites:

```javascript
// Example test case
test('Students can only view their own progress', async () => {
  const { data: studentProgress } = await studentClient
    .from('progress')
    .select('*');

  // All progress records should belong to the student
  studentProgress.forEach(record => {
    expect(record.user_id).toBe(studentUser.id);
  });
});
```

## Authentication & Authorization

### JWT Token Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "student|teacher|admin",
  "aud": "authenticated",
  "exp": 1234567890,
  "iat": 1234567890
}
```

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **Student** | - View own progress<br>- Access enrolled classrooms<br>- Submit assignments<br>- Update own profile |
| **Teacher** | - View all student data in their classrooms<br>- Create and manage assignments<br>- Grade submissions<br>- Manage classroom enrollments |
| **Admin** | - Full system access<br>- User management<br>- System configuration<br>- Audit logs |

### Session Management

- JWT tokens expire after 7 days by default
- Refresh tokens are used for seamless re-authentication
- Sessions are invalidated on logout
- Concurrent session limits can be enforced

## Database Security

### Connection Security

```javascript
// Secure connection configuration
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'rls-guard-dog@1.0.0'
    }
  }
});
```

### Data Encryption

- All data is encrypted at rest using AES-256
- Sensitive fields use additional application-level encryption
- Database connections use TLS 1.3
- Backup files are encrypted before storage

### Input Validation

```javascript
// Example input validation
function validateAssignmentData(data) {
  const schema = {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 2000 },
    due_date: { type: 'string', format: 'date-time' },
    max_points: { type: 'integer', minimum: 1, maximum: 1000 }
  };
  
  return validate(data, schema);
}
```

## API Security

### Rate Limiting

```javascript
// Rate limiting configuration
const rateLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
};
```

### CORS Configuration

```javascript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
```

### Security Headers

```javascript
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
};
```

## Frontend Security

### XSS Prevention

```javascript
// HTML sanitization
function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

// Safe DOM manipulation
function updateContent(element, content) {
  element.textContent = content; // Prevents XSS
}
```

### CSRF Protection

```javascript
// CSRF token validation
function validateCSRFToken(token) {
  const storedToken = sessionStorage.getItem('csrf_token');
  return token === storedToken;
}
```

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://cdn.jsdelivr.net; 
               style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
               img-src 'self' data: https:;
               connect-src 'self' https://*.supabase.co;">
```

## Security Testing

### Automated Security Tests

```bash
# Run security test suite
npm run test:security

# Run specific RLS tests
npm run test -- tests/security/rls-policies.test.js

# Run penetration tests
npm run test:penetration
```

### Manual Security Testing

1. **Authentication Bypass Testing**
   - Attempt to access protected routes without authentication
   - Try to escalate privileges between roles
   - Test session fixation and hijacking

2. **SQL Injection Testing**
   - Test all input fields with SQL injection payloads
   - Verify parameterized queries are used
   - Check for second-order SQL injection

3. **XSS Testing**
   - Test all user inputs for XSS vulnerabilities
   - Verify output encoding is implemented
   - Check for DOM-based XSS

### Security Audit Checklist

- [ ] All RLS policies are tested and working
- [ ] Authentication mechanisms are secure
- [ ] Input validation is comprehensive
- [ ] Output encoding prevents XSS
- [ ] HTTPS is enforced in production
- [ ] Security headers are properly configured
- [ ] Rate limiting is implemented
- [ ] Error messages don't leak sensitive information
- [ ] Logging captures security events
- [ ] Dependencies are up to date and secure

## Deployment Security

### Environment Configuration

```bash
# Production environment variables
NODE_ENV=production
HTTPS_ONLY=true
SECURE_COOKIES=true
HSTS_ENABLED=true
CSP_ENABLED=true
```

### Infrastructure Security

1. **Network Security**
   - VPC with private subnets
   - Security groups with minimal required access
   - WAF protection for web applications
   - DDoS protection enabled

2. **Server Security**
   - Regular security updates
   - Minimal attack surface
   - Intrusion detection systems
   - Log monitoring and alerting

3. **Database Security**
   - Encrypted connections only
   - Regular backups with encryption
   - Access logging enabled
   - Network isolation

## Security Monitoring

### Logging Strategy

```javascript
// Security event logging
function logSecurityEvent(event, details) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: event,
    user_id: details.user_id,
    ip_address: details.ip_address,
    user_agent: details.user_agent,
    details: details
  };
  
  securityLogger.warn(logEntry);
}
```

### Monitoring Alerts

- Failed authentication attempts
- Privilege escalation attempts
- Unusual data access patterns
- Rate limit violations
- SQL injection attempts
- XSS attempts

### Metrics to Track

- Authentication success/failure rates
- API response times
- Error rates by endpoint
- User session durations
- Data access patterns
- Security policy violations

## Incident Response

### Response Plan

1. **Detection**
   - Automated monitoring alerts
   - User reports
   - Security audit findings

2. **Assessment**
   - Determine severity level
   - Identify affected systems
   - Assess potential impact

3. **Containment**
   - Isolate affected systems
   - Revoke compromised credentials
   - Block malicious traffic

4. **Eradication**
   - Remove malicious code
   - Patch vulnerabilities
   - Update security controls

5. **Recovery**
   - Restore systems from clean backups
   - Verify system integrity
   - Monitor for recurring issues

6. **Lessons Learned**
   - Document incident details
   - Update security procedures
   - Improve monitoring and detection

### Contact Information

- **Security Team**: security@rlsguarddog.com
- **Emergency Contact**: +1-555-SECURITY
- **Incident Reporting**: incidents@rlsguarddog.com

## Security Best Practices

### For Developers

1. **Secure Coding**
   - Always validate input
   - Use parameterized queries
   - Implement proper error handling
   - Follow principle of least privilege

2. **Code Review**
   - Security-focused code reviews
   - Automated security scanning
   - Dependency vulnerability checks
   - Regular security training

3. **Testing**
   - Write security test cases
   - Perform regular penetration testing
   - Use automated security tools
   - Test RLS policies thoroughly

### For Users

1. **Password Security**
   - Use strong, unique passwords
   - Enable two-factor authentication
   - Regularly update passwords
   - Don't share credentials

2. **Safe Browsing**
   - Keep browsers updated
   - Be cautious with downloads
   - Verify SSL certificates
   - Report suspicious activity

## Compliance

### Standards Compliance

- **OWASP Top 10**: All vulnerabilities addressed
- **GDPR**: Data protection and privacy controls
- **FERPA**: Educational record privacy (US)
- **SOC 2**: Security and availability controls

### Regular Audits

- Quarterly security assessments
- Annual penetration testing
- Continuous vulnerability scanning
- Compliance audits as required

## Resources

### Documentation

- [OWASP Security Guide](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

### Tools

- [OWASP ZAP](https://www.zaproxy.org/) - Security testing
- [Burp Suite](https://portswigger.net/burp) - Web application security
- [SQLMap](https://sqlmap.org/) - SQL injection testing
- [Nmap](https://nmap.org/) - Network security scanning

---

**Remember**: Security is an ongoing process, not a one-time implementation. Regular reviews, updates, and testing are essential to maintain a secure system.

For questions or security concerns, please contact our security team at security@rlsguarddog.com.
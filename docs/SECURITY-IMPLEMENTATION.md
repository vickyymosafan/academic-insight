# Security Implementation - Academic Insight PWA

## Overview

This document outlines the security measures implemented in the Academic Insight PWA application to protect user data and prevent common web vulnerabilities.

## 1. Input Validation and Sanitization

### Client-Side Validation

All form inputs are validated on the client-side using the centralized validation utilities in `src/lib/validation.ts`:

- **Email validation**: RFC-compliant email format checking
- **NIM validation**: 8-12 digit numeric format
- **IPK validation**: Range validation (0.00 - 4.00)
- **Semester validation**: Range validation (1 - 14)
- **Angkatan validation**: Year range validation (2000 - current year)
- **String length validation**: Minimum and maximum length checks

### Server-Side Validation

All API endpoints implement server-side validation to prevent malicious data:

- **Input sanitization**: Removes HTML tags, script tags, and event handlers
- **XSS protection**: Escapes special characters and removes javascript: protocols
- **SQL injection prevention**: Uses parameterized queries through Supabase
- **UUID validation**: Validates ID format before database queries

### Validation Functions

```typescript
// Available validation functions
- sanitizeString(input: string): string
- sanitizeObject<T>(obj: T): T
- isValidEmail(email: string): boolean
- isValidNIM(nim: string): boolean
- isValidIPK(ipk: number | string): boolean
- isValidSemester(semester: number | string): boolean
- isValidAngkatan(angkatan: number | string): boolean
- validateStudentData(data: any, isUpdate: boolean): ValidationResult
- validateLoginData(data: any): ValidationResult
- escapeHtml(text: string): string
- sanitizeSearchQuery(query: string): string
```

## 2. Security Headers

### Implemented Headers

The following security headers are configured in `next.config.ts`:

#### Strict-Transport-Security (HSTS)
```
max-age=63072000; includeSubDomains; preload
```
Forces HTTPS connections for 2 years, including all subdomains.

#### X-Frame-Options
```
SAMEORIGIN
```
Prevents clickjacking attacks by disallowing the site to be embedded in iframes from other origins.

#### X-Content-Type-Options
```
nosniff
```
Prevents MIME type sniffing, forcing browsers to respect declared content types.

#### X-XSS-Protection
```
1; mode=block
```
Enables browser's built-in XSS protection and blocks detected attacks.

#### Referrer-Policy
```
strict-origin-when-cross-origin
```
Controls referrer information sent with requests.

#### Permissions-Policy
```
camera=(), microphone=(), geolocation=()
```
Disables unnecessary browser features to reduce attack surface.

#### Content-Security-Policy (CSP)
```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https: blob:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co;
frame-ancestors 'self';
base-uri 'self';
form-action 'self'
```

**Note**: `unsafe-inline` and `unsafe-eval` are currently enabled for Next.js compatibility. Consider implementing nonces or hashes for stricter CSP in production.

## 3. HTTPS and Secure Cookies

### HTTPS Redirect

The middleware (`src/middleware.ts`) automatically redirects HTTP requests to HTTPS in production:

```typescript
if (
  process.env.NODE_ENV === 'production' &&
  req.headers.get('x-forwarded-proto') !== 'https'
) {
  return NextResponse.redirect(`https://${req.headers.get('host')}...`, 301);
}
```

### Secure Cookie Configuration

All authentication cookies are configured with secure attributes:

- **secure**: true (in production) - Only transmitted over HTTPS
- **httpOnly**: true - Not accessible via JavaScript
- **sameSite**: 'lax' - CSRF protection

## 4. Authentication and Authorization

### Row Level Security (RLS)

Database access is protected using Supabase Row Level Security policies:

- **Students table**: Authenticated users can view, only admins can modify
- **Profiles table**: Users can view all profiles, only update their own
- **Grades table**: Lecturers can only see grades for their courses, admins see all

### API Route Protection

All API routes implement authentication and authorization checks:

```typescript
// Check authentication
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Check admin role for write operations
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (!profile || profile.role !== 'admin') {
  return NextResponse.json(
    { error: 'Forbidden: Only admins can modify students' },
    { status: 403 }
  );
}
```

### Protected Routes

The middleware protects routes requiring authentication:

- `/dashboard/*` - Requires authentication
- `/admin/*` - Requires authentication and admin role
- `/auth/login` - Redirects to dashboard if already authenticated

## 5. Error Handling

### Secure Error Messages

Error messages are user-friendly and don't expose sensitive information:

- Generic error messages for authentication failures
- No stack traces or internal details in production
- Detailed errors logged server-side only

### Error Logging

Errors are logged server-side for debugging without exposing details to clients:

```typescript
console.error('Database error:', error);
return NextResponse.json(
  { error: 'Gagal mengambil data mahasiswa' },
  { status: 500 }
);
```

## 6. Best Practices

### Environment Variables

Sensitive configuration is stored in environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Never commit `.env.local` to version control.

### Rate Limiting

Consider implementing rate limiting for API endpoints to prevent abuse:

- Login attempts
- API calls per user/IP
- Form submissions

### Regular Updates

Keep dependencies updated to patch security vulnerabilities:

```bash
npm audit
npm update
```

### Security Checklist

- [x] Input validation (client and server)
- [x] XSS protection
- [x] SQL injection prevention
- [x] HTTPS enforcement
- [x] Secure cookies
- [x] Security headers
- [x] Content Security Policy
- [x] Authentication and authorization
- [x] Row Level Security
- [x] Protected routes
- [x] Secure error handling
- [ ] Rate limiting (recommended for production)
- [ ] CAPTCHA for login (recommended for production)
- [ ] Security audit (recommended before production)

## 7. Testing Security

### Manual Testing

1. Test XSS prevention by submitting `<script>alert('XSS')</script>` in forms
2. Verify HTTPS redirect in production
3. Check security headers using browser DevTools
4. Test authentication flows and protected routes
5. Verify RLS policies with different user roles

### Automated Testing

Consider implementing security tests:

```typescript
describe('Security', () => {
  it('should sanitize XSS attempts', () => {
    const malicious = '<script>alert("XSS")</script>';
    const sanitized = sanitizeString(malicious);
    expect(sanitized).not.toContain('<script>');
  });

  it('should prevent unauthorized access', async () => {
    const response = await fetch('/api/students', {
      method: 'POST',
      // No auth token
    });
    expect(response.status).toBe(401);
  });
});
```

## 8. Incident Response

If a security vulnerability is discovered:

1. Assess the severity and impact
2. Patch the vulnerability immediately
3. Review logs for potential exploitation
4. Notify affected users if necessary
5. Document the incident and response
6. Update security measures to prevent recurrence

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

# Security Testing Guide

## Overview

Panduan ini menjelaskan cara melakukan testing terhadap implementasi security headers, HTTPS redirect, dan secure cookies pada aplikasi Academic Insight PWA.

## Prerequisites

- Node.js installed
- Aplikasi berjalan di development atau production
- Access ke production URL (untuk production testing)

## Testing Methods

### 1. Automated Testing dengan Script

#### Test di Development (localhost)

```bash
# Start development server
npm run dev

# Di terminal baru, jalankan security test
npm run test:security
```

#### Test di Production

```bash
# Update URL di package.json atau jalankan langsung
npm run test:security:prod

# Atau dengan custom URL
node scripts/test-security-headers.js https://your-domain.vercel.app
```

#### Expected Output

```
🔒 Testing Security Headers for: http://localhost:3000

Status Code: 200

Security Headers Check:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Strict-Transport-Security (HSTS)
   Value: max-age=63072000; includeSubDomains; preload

✅ X-Frame-Options
   Value: SAMEORIGIN

✅ X-Content-Type-Options
   Value: nosniff

✅ X-XSS-Protection
   Value: 1; mode=block

✅ Referrer-Policy
   Value: strict-origin-when-cross-origin

✅ Permissions-Policy
   Value: camera=(), microphone=(), geolocation=()

✅ Content-Security-Policy (CSP)
   Value: default-src 'self'; script-src 'self' 'unsafe-eval'...

✅ X-DNS-Prefetch-Control
   Value: on

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cookie Security Check:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cookie 1:
  ✅ Secure flag
  ✅ HttpOnly flag
  ✅ SameSite attribute
  Value: sb-access-token=...; Path=/; HttpOnly; Secure; SameSite=Lax

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HTTPS Redirect Check:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ HTTP to HTTPS redirect working
   Redirects to: https://your-domain.vercel.app

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Passed: 8
⚠️  Warnings: 0
❌ Failed: 0

🎉 All security headers are properly configured!
```

### 2. Manual Testing dengan Browser DevTools

#### Step 1: Open DevTools
1. Buka aplikasi di browser (Chrome/Firefox/Edge)
2. Tekan F12 atau klik kanan → Inspect
3. Pergi ke tab **Network**

#### Step 2: Check Response Headers
1. Refresh halaman (Ctrl+R atau Cmd+R)
2. Klik request pertama (biasanya document)
3. Scroll ke bagian **Response Headers**
4. Verify semua security headers ada

#### Step 3: Check Cookies
1. Pergi ke tab **Application** (Chrome) atau **Storage** (Firefox)
2. Expand **Cookies** di sidebar
3. Klik domain aplikasi
4. Verify cookie attributes:
   - ✅ Secure flag (production only)
   - ✅ HttpOnly flag
   - ✅ SameSite attribute

#### Step 4: Check CSP Violations
1. Pergi ke tab **Console**
2. Look for CSP violation messages
3. Jika ada violations, update CSP di `next.config.ts`

### 3. Testing dengan curl

#### Test Security Headers

```bash
# Basic header check
curl -I https://your-domain.vercel.app

# Detailed header check
curl -v https://your-domain.vercel.app 2>&1 | grep -i "< "

# Check specific header
curl -I https://your-domain.vercel.app | grep -i "strict-transport-security"
```

#### Test HTTPS Redirect

```bash
# Test HTTP to HTTPS redirect
curl -I http://your-domain.vercel.app

# Should return:
# HTTP/1.1 301 Moved Permanently
# Location: https://your-domain.vercel.app
```

#### Test Cookie Security

```bash
# Get cookies with verbose output
curl -v -c cookies.txt https://your-domain.vercel.app/auth/login

# Check cookie file
cat cookies.txt

# Should show:
# #HttpOnly_your-domain.vercel.app  FALSE  /  TRUE  ...
```

### 4. Online Security Scanners

#### Mozilla Observatory
1. Pergi ke https://observatory.mozilla.org/
2. Masukkan URL aplikasi
3. Klik **Scan Me**
4. Target: **A+ rating**

**Expected Results:**
- Content Security Policy: ✅ Pass
- Cookies: ✅ Pass
- Cross-origin Resource Sharing: ✅ Pass
- HTTP Strict Transport Security: ✅ Pass
- Redirection: ✅ Pass
- Referrer Policy: ✅ Pass
- Subresource Integrity: ⚠️ Optional
- X-Content-Type-Options: ✅ Pass
- X-Frame-Options: ✅ Pass
- X-XSS-Protection: ✅ Pass

#### Security Headers
1. Pergi ke https://securityheaders.com/
2. Masukkan URL aplikasi
3. Klik **Scan**
4. Target: **A rating**

**Expected Headers:**
- Strict-Transport-Security: ✅
- Content-Security-Policy: ✅
- X-Frame-Options: ✅
- X-Content-Type-Options: ✅
- Referrer-Policy: ✅
- Permissions-Policy: ✅

#### SSL Labs
1. Pergi ke https://www.ssllabs.com/ssltest/
2. Masukkan hostname aplikasi
3. Klik **Submit**
4. Target: **A+ rating**

**Expected Results:**
- Certificate: ✅ Valid
- Protocol Support: ✅ TLS 1.2, TLS 1.3
- Key Exchange: ✅ Strong
- Cipher Strength: ✅ Strong
- HSTS: ✅ Enabled

### 5. Testing CSP dengan Browser

#### Enable CSP Reporting in Console

Chrome DevTools:
1. Open DevTools (F12)
2. Go to **Console** tab
3. Enable **Preserve log**
4. Navigate aplikasi
5. Look for CSP violation messages

Firefox DevTools:
1. Open DevTools (F12)
2. Go to **Console** tab
3. Filter by **CSP**
4. Navigate aplikasi
5. Review violations

#### Common CSP Violations

**Inline Script Violation:**
```
Refused to execute inline script because it violates the following 
Content Security Policy directive: "script-src 'self'"
```

**Solution:**
- Use external script files
- Or add nonce/hash to CSP
- Or add 'unsafe-inline' (not recommended)

**External Resource Violation:**
```
Refused to load the image 'https://example.com/image.jpg' because it 
violates the following Content Security Policy directive: "img-src 'self'"
```

**Solution:**
- Add domain to img-src directive
- Or use data: URIs
- Or proxy through your domain

### 6. Testing HTTPS Redirect

#### Test with Different Protocols

```bash
# Test HTTP (should redirect to HTTPS)
curl -L http://your-domain.vercel.app

# Test HTTPS (should work directly)
curl -L https://your-domain.vercel.app

# Test with www subdomain
curl -L http://www.your-domain.vercel.app
curl -L https://www.your-domain.vercel.app
```

#### Test in Different Environments

**Development:**
```bash
# Should NOT redirect (for easier development)
curl -I http://localhost:3000
# Expected: 200 OK
```

**Production:**
```bash
# Should redirect to HTTPS
curl -I http://your-domain.vercel.app
# Expected: 301 Moved Permanently
# Location: https://your-domain.vercel.app
```

### 7. Testing Secure Cookies

#### Test Cookie Attributes

```javascript
// In browser console
document.cookie.split(';').forEach(cookie => {
  console.log(cookie.trim());
});

// Should NOT see HttpOnly cookies (they're hidden from JavaScript)
// This is correct behavior!
```

#### Test Cookie Security in Network Tab

1. Open DevTools → Network tab
2. Login to aplikasi
3. Find login request
4. Check **Response Headers** → **Set-Cookie**
5. Verify attributes:
   ```
   Set-Cookie: sb-access-token=...; Path=/; HttpOnly; Secure; SameSite=Lax
   ```

#### Test Cookie Persistence

1. Login to aplikasi
2. Close browser completely
3. Open browser again
4. Navigate to aplikasi
5. Should still be logged in (session persisted)

### 8. Performance Testing with Security Headers

#### Lighthouse Audit

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://your-domain.vercel.app --view

# Or use Chrome DevTools:
# 1. Open DevTools (F12)
# 2. Go to Lighthouse tab
# 3. Click "Generate report"
```

**Expected Scores:**
- Performance: >90
- Accessibility: >90
- Best Practices: 100 (with all security headers)
- SEO: >90
- PWA: 100

#### WebPageTest

1. Pergi ke https://www.webpagetest.org/
2. Masukkan URL aplikasi
3. Select location dan browser
4. Klik **Start Test**
5. Review security grade

## Troubleshooting

### Issue: Security Headers Not Applied

**Symptoms:**
- Headers missing in browser DevTools
- Security scanners report missing headers

**Solutions:**
1. Check `next.config.ts` configuration
2. Rebuild aplikasi: `npm run build`
3. Restart server: `npm start`
4. Clear browser cache
5. Check Vercel deployment logs

### Issue: CSP Blocking Resources

**Symptoms:**
- Console shows CSP violations
- Images/scripts not loading
- Styles not applied

**Solutions:**
1. Identify blocked resource in console
2. Update CSP directive in `next.config.ts`
3. Add domain to whitelist
4. Or use nonce/hash for inline resources
5. Redeploy aplikasi

### Issue: HTTPS Redirect Not Working

**Symptoms:**
- HTTP requests not redirecting to HTTPS
- Mixed content warnings

**Solutions:**
1. Check `NODE_ENV` is set to 'production'
2. Verify middleware in `src/middleware.ts`
3. Check Vercel HTTPS settings
4. Verify SSL certificate is valid
5. Check DNS configuration

### Issue: Cookies Not Persisting

**Symptoms:**
- User logged out after browser close
- Session not maintained

**Solutions:**
1. Check cookie attributes in Network tab
2. Verify `secure` flag matches environment
3. Check `sameSite` attribute
4. Verify domain matches
5. Check browser cookie settings

### Issue: Development Server Issues

**Symptoms:**
- Security headers causing issues in development
- Unable to test with external tools

**Solutions:**
1. Use environment-specific configuration
2. Disable strict CSP in development
3. Use `secure: false` for cookies in development
4. Test security features in production/staging only

## Best Practices

### 1. Regular Testing Schedule

- **Daily**: Automated tests in CI/CD
- **Weekly**: Manual browser testing
- **Monthly**: Full security audit with online scanners
- **Quarterly**: Penetration testing

### 2. Monitoring

- Setup CSP reporting endpoint
- Monitor security headers in production
- Track cookie security metrics
- Alert on security header changes

### 3. Documentation

- Document all security configurations
- Keep testing procedures updated
- Record security audit results
- Maintain security changelog

### 4. Continuous Improvement

- Review security best practices regularly
- Update headers based on new threats
- Tighten CSP gradually
- Remove unnecessary 'unsafe-*' directives

## Checklist

Gunakan checklist ini untuk verify security implementation:

### Security Headers
- [ ] Strict-Transport-Security configured
- [ ] X-Frame-Options set to SAMEORIGIN
- [ ] X-Content-Type-Options set to nosniff
- [ ] X-XSS-Protection enabled
- [ ] Referrer-Policy configured
- [ ] Permissions-Policy configured
- [ ] Content-Security-Policy comprehensive
- [ ] X-DNS-Prefetch-Control enabled

### HTTPS
- [ ] HTTPS redirect working in production
- [ ] SSL certificate valid
- [ ] TLS 1.2+ enabled
- [ ] HSTS preload eligible
- [ ] Mixed content resolved

### Cookies
- [ ] Secure flag enabled in production
- [ ] HttpOnly flag set
- [ ] SameSite attribute configured
- [ ] Cookie domain correct
- [ ] Session persistence working

### Testing
- [ ] Automated tests passing
- [ ] Manual browser tests completed
- [ ] Online scanners show A+ rating
- [ ] CSP violations resolved
- [ ] Performance not impacted

### Documentation
- [ ] Security headers documented
- [ ] Testing procedures documented
- [ ] Troubleshooting guide available
- [ ] Team trained on security features

## Resources

- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [CSP Reference](https://content-security-policy.com/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Vercel Security](https://vercel.com/docs/security)

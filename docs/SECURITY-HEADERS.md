# Security Headers Implementation

## Overview

Aplikasi Academic Insight PWA telah dikonfigurasi dengan security headers yang komprehensif untuk melindungi dari berbagai serangan web umum. Implementasi ini mengikuti best practices keamanan web modern.

## Security Headers yang Diimplementasikan

### 1. Strict-Transport-Security (HSTS)
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

**Fungsi:**
- Memaksa browser untuk selalu menggunakan HTTPS
- Mencegah downgrade attacks dan man-in-the-middle attacks
- `max-age=63072000`: Berlaku selama 2 tahun
- `includeSubDomains`: Berlaku untuk semua subdomain
- `preload`: Memungkinkan domain untuk masuk HSTS preload list

### 2. X-Frame-Options
```
X-Frame-Options: SAMEORIGIN
```

**Fungsi:**
- Mencegah clickjacking attacks
- Hanya mengizinkan framing dari origin yang sama
- Melindungi dari UI redressing attacks

### 3. X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```

**Fungsi:**
- Mencegah MIME type sniffing
- Browser tidak akan mengubah content-type yang dideklarasikan
- Melindungi dari XSS attacks via MIME confusion

### 4. X-XSS-Protection
```
X-XSS-Protection: 1; mode=block
```

**Fungsi:**
- Mengaktifkan XSS filter bawaan browser
- Mode block akan menghentikan rendering halaman jika XSS terdeteksi
- Layer tambahan proteksi untuk browser lama

### 5. Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```

**Fungsi:**
- Mengontrol informasi referrer yang dikirim
- Mengirim full URL untuk same-origin requests
- Hanya mengirim origin untuk cross-origin requests
- Melindungi privasi user dan mencegah information leakage

### 6. Permissions-Policy
```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Fungsi:**
- Menonaktifkan akses ke fitur browser yang tidak diperlukan
- Mencegah malicious scripts mengakses hardware
- Mengurangi attack surface

### 7. Content-Security-Policy (CSP)

CSP yang komprehensif untuk melindungi dari XSS dan injection attacks:

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live wss://vercel.live;
  frame-ancestors 'self';
  base-uri 'self';
  form-action 'self';
  object-src 'none';
  upgrade-insecure-requests;
  block-all-mixed-content
```

**Penjelasan Directive:**

- **default-src 'self'**: Default policy - hanya izinkan resource dari origin yang sama
- **script-src**: 
  - `'self'`: Script dari origin yang sama
  - `'unsafe-eval'`: Diperlukan untuk Next.js development
  - `'unsafe-inline'`: Diperlukan untuk inline scripts
  - `https://vercel.live`: Untuk Vercel analytics
- **style-src**: 
  - `'self'`: Styles dari origin yang sama
  - `'unsafe-inline'`: Diperlukan untuk styled-components/Tailwind
  - `https://fonts.googleapis.com`: Google Fonts
- **font-src**: 
  - `'self'`: Fonts dari origin yang sama
  - `https://fonts.gstatic.com`: Google Fonts
  - `data:`: Data URIs untuk inline fonts
- **img-src**: 
  - `'self'`: Images dari origin yang sama
  - `data:`: Data URIs
  - `https:`: HTTPS images dari external sources
  - `blob:`: Blob URLs untuk dynamic images
- **connect-src**: 
  - `'self'`: API calls ke origin yang sama
  - `https://*.supabase.co`: Supabase REST API
  - `wss://*.supabase.co`: Supabase Realtime WebSocket
  - `https://vercel.live`: Vercel analytics
  - `wss://vercel.live`: Vercel live updates
- **frame-ancestors 'self'**: Hanya izinkan framing dari origin yang sama
- **base-uri 'self'**: Batasi base tag ke origin yang sama
- **form-action 'self'**: Batasi form submission ke origin yang sama
- **object-src 'none'**: Blokir semua plugins (Flash, Java, etc.)
- **upgrade-insecure-requests**: Upgrade HTTP requests ke HTTPS
- **block-all-mixed-content**: Blokir mixed content (HTTP di HTTPS page)

### 8. X-DNS-Prefetch-Control
```
X-DNS-Prefetch-Control: on
```

**Fungsi:**
- Mengaktifkan DNS prefetching
- Meningkatkan performance dengan pre-resolve DNS
- Mempercepat loading external resources

## HTTPS Redirect Implementation

### Middleware Configuration

File: `src/middleware.ts`

```typescript
// HTTPS redirect in production
if (
  process.env.NODE_ENV === 'production' &&
  req.headers.get('x-forwarded-proto') !== 'https'
) {
  return NextResponse.redirect(
    `https://${req.headers.get('host')}${req.nextUrl.pathname}${req.nextUrl.search}`,
    301
  );
}
```

**Fungsi:**
- Otomatis redirect HTTP ke HTTPS di production
- Menggunakan 301 permanent redirect
- Memeriksa `x-forwarded-proto` header (Vercel/proxy standard)
- Mempertahankan path dan query parameters

## Secure Cookies Implementation

### Cookie Configuration

File: `src/middleware.ts`

```typescript
const secureOptions = {
  ...options,
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'lax' as const,
};
```

**Atribut Cookie:**

1. **secure: true** (production only)
   - Cookie hanya dikirim via HTTPS
   - Mencegah cookie interception di HTTP

2. **httpOnly: true**
   - Cookie tidak dapat diakses via JavaScript
   - Melindungi dari XSS attacks
   - Mencegah cookie theft via client-side scripts

3. **sameSite: 'lax'**
   - Melindungi dari CSRF attacks
   - Cookie dikirim untuk top-level navigation
   - Tidak dikirim untuk cross-site subrequests
   - Balance antara security dan usability

## Testing Security Headers

### 1. Manual Testing dengan Browser DevTools

```bash
# Buka aplikasi di browser
# Buka DevTools (F12)
# Pergi ke Network tab
# Refresh halaman
# Klik request pertama
# Lihat Response Headers
```

### 2. Testing dengan curl

```bash
# Test security headers
curl -I https://your-domain.vercel.app

# Test HTTPS redirect
curl -I http://your-domain.vercel.app
```

### 3. Online Security Scanners

- **Mozilla Observatory**: https://observatory.mozilla.org/
- **Security Headers**: https://securityheaders.com/
- **SSL Labs**: https://www.ssllabs.com/ssltest/

### 4. Expected Results

Aplikasi harus mendapat rating A+ dari security scanners dengan semua headers berikut:

✅ Strict-Transport-Security
✅ X-Frame-Options
✅ X-Content-Type-Options
✅ X-XSS-Protection
✅ Referrer-Policy
✅ Permissions-Policy
✅ Content-Security-Policy

## Troubleshooting

### CSP Violations

Jika ada CSP violations di console:

1. **Identify the violation**
   ```
   Refused to load the script 'https://example.com/script.js' because it violates the following Content Security Policy directive: "script-src 'self'"
   ```

2. **Update CSP directive**
   - Tambahkan domain ke whitelist jika trusted
   - Atau gunakan nonce/hash untuk inline scripts

3. **Test changes**
   - Deploy dan test di production
   - Monitor console untuk violations baru

### HTTPS Redirect Issues

Jika redirect tidak bekerja:

1. **Check environment**
   ```bash
   echo $NODE_ENV
   # Harus 'production'
   ```

2. **Check headers**
   ```bash
   curl -H "x-forwarded-proto: http" https://your-domain.vercel.app
   # Harus redirect ke HTTPS
   ```

3. **Vercel configuration**
   - Pastikan Vercel automatic HTTPS enabled
   - Check domain SSL certificate

### Cookie Issues

Jika cookies tidak tersimpan:

1. **Check secure flag**
   - Development: secure = false
   - Production: secure = true

2. **Check sameSite**
   - Gunakan 'lax' untuk compatibility
   - Gunakan 'strict' untuk maximum security

3. **Check domain**
   - Cookie domain harus match dengan aplikasi domain
   - Subdomain handling dengan domain attribute

## Best Practices

### 1. Regular Security Audits
- Jalankan security scanners setiap deployment
- Monitor CSP violations di production
- Update headers sesuai best practices terbaru

### 2. CSP Reporting
Tambahkan CSP reporting untuk monitor violations:

```typescript
"report-uri /api/csp-report",
"report-to csp-endpoint"
```

### 3. Gradual CSP Tightening
- Mulai dengan CSP yang permissive
- Monitor violations
- Gradually remove 'unsafe-inline' dan 'unsafe-eval'
- Gunakan nonces atau hashes untuk inline scripts

### 4. Environment-Specific Configuration
```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

const cspDirectives = [
  "default-src 'self'",
  isDevelopment 
    ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'" 
    : "script-src 'self' 'unsafe-eval'",
  // ... other directives
];
```

## Compliance

Implementasi security headers ini memenuhi requirements:

✅ **Requirement 8.2**: Setup HTTPS dan security headers
- HTTPS redirect di production
- Comprehensive security headers
- Content Security Policy
- Secure cookies dengan httpOnly dan sameSite

## References

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Vercel Security Best Practices](https://vercel.com/docs/security)

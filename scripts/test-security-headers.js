#!/usr/bin/env node

/**
 * Script untuk testing security headers
 * Usage: node scripts/test-security-headers.js [URL]
 * 
 * Jika URL tidak diberikan, akan menggunakan localhost:3000
 */

const https = require('https');
const http = require('http');

const url = process.argv[2] || 'http://localhost:3000';
const urlObj = new URL(url);
const isHttps = urlObj.protocol === 'https:';

console.log(`\n🔒 Testing Security Headers for: ${url}\n`);

const options = {
  hostname: urlObj.hostname,
  port: urlObj.port || (isHttps ? 443 : 80),
  path: urlObj.pathname,
  method: 'GET',
  headers: {
    'User-Agent': 'Security-Headers-Test/1.0'
  }
};

const client = isHttps ? https : http;

const req = client.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}\n`);

  // Expected security headers
  const securityHeaders = {
    'strict-transport-security': {
      name: 'Strict-Transport-Security (HSTS)',
      expected: 'max-age=63072000; includeSubDomains; preload',
      critical: true
    },
    'x-frame-options': {
      name: 'X-Frame-Options',
      expected: 'SAMEORIGIN',
      critical: true
    },
    'x-content-type-options': {
      name: 'X-Content-Type-Options',
      expected: 'nosniff',
      critical: true
    },
    'x-xss-protection': {
      name: 'X-XSS-Protection',
      expected: '1; mode=block',
      critical: false
    },
    'referrer-policy': {
      name: 'Referrer-Policy',
      expected: 'strict-origin-when-cross-origin',
      critical: false
    },
    'permissions-policy': {
      name: 'Permissions-Policy',
      expected: 'camera=(), microphone=(), geolocation=()',
      critical: false
    },
    'content-security-policy': {
      name: 'Content-Security-Policy (CSP)',
      expected: 'default-src',
      critical: true
    },
    'x-dns-prefetch-control': {
      name: 'X-DNS-Prefetch-Control',
      expected: 'on',
      critical: false
    }
  };

  let passCount = 0;
  let failCount = 0;
  let warningCount = 0;

  console.log('Security Headers Check:\n');
  console.log('━'.repeat(80));

  Object.keys(securityHeaders).forEach(headerKey => {
    const header = securityHeaders[headerKey];
    const value = res.headers[headerKey];

    if (value) {
      const matches = value.includes(header.expected);
      if (matches) {
        console.log(`✅ ${header.name}`);
        console.log(`   Value: ${value}`);
        passCount++;
      } else {
        console.log(`⚠️  ${header.name}`);
        console.log(`   Expected: ${header.expected}`);
        console.log(`   Got: ${value}`);
        warningCount++;
      }
    } else {
      if (header.critical) {
        console.log(`❌ ${header.name} - MISSING (CRITICAL)`);
        failCount++;
      } else {
        console.log(`⚠️  ${header.name} - MISSING`);
        warningCount++;
      }
    }
    console.log('');
  });

  console.log('━'.repeat(80));
  console.log('\nCookie Security Check:\n');
  console.log('━'.repeat(80));

  const setCookieHeaders = res.headers['set-cookie'];
  if (setCookieHeaders && setCookieHeaders.length > 0) {
    setCookieHeaders.forEach((cookie, index) => {
      console.log(`Cookie ${index + 1}:`);
      
      const hasSecure = cookie.includes('Secure');
      const hasHttpOnly = cookie.includes('HttpOnly');
      const hasSameSite = cookie.includes('SameSite');

      console.log(`  ${hasSecure ? '✅' : '❌'} Secure flag`);
      console.log(`  ${hasHttpOnly ? '✅' : '❌'} HttpOnly flag`);
      console.log(`  ${hasSameSite ? '✅' : '❌'} SameSite attribute`);
      console.log(`  Value: ${cookie.substring(0, 100)}${cookie.length > 100 ? '...' : ''}`);
      console.log('');
    });
  } else {
    console.log('ℹ️  No cookies set in this response\n');
  }

  console.log('━'.repeat(80));
  console.log('\nHTTPS Redirect Check:\n');
  console.log('━'.repeat(80));

  if (!isHttps && res.statusCode === 301 || res.statusCode === 302) {
    const location = res.headers['location'];
    if (location && location.startsWith('https://')) {
      console.log('✅ HTTP to HTTPS redirect working');
      console.log(`   Redirects to: ${location}\n`);
    } else {
      console.log('❌ Redirect found but not to HTTPS');
      console.log(`   Redirects to: ${location}\n`);
    }
  } else if (isHttps) {
    console.log('✅ Already using HTTPS\n');
  } else {
    console.log('⚠️  No HTTPS redirect detected (may be expected in development)\n');
  }

  console.log('━'.repeat(80));
  console.log('\nSummary:\n');
  console.log('━'.repeat(80));
  console.log(`✅ Passed: ${passCount}`);
  console.log(`⚠️  Warnings: ${warningCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('');

  if (failCount === 0 && warningCount === 0) {
    console.log('🎉 All security headers are properly configured!\n');
    process.exit(0);
  } else if (failCount === 0) {
    console.log('✓ Critical security headers are configured, but some optional headers are missing.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some critical security headers are missing. Please review the configuration.\n');
    process.exit(1);
  }
});

req.on('error', (error) => {
  console.error(`\n❌ Error testing security headers: ${error.message}\n`);
  console.log('Make sure the application is running and accessible.\n');
  process.exit(1);
});

req.end();

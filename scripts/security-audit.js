/**
 * Security Audit Script
 * Checks for common security issues and vulnerabilities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkEnvironmentVariables() {
  log('\n' + '='.repeat(60), colors.bright);
  log('ENVIRONMENT VARIABLES CHECK', colors.bright);
  log('='.repeat(60) + '\n', colors.bright);

  const issues = [];

  // Check .env.example exists
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  if (!fs.existsSync(envExamplePath)) {
    issues.push({
      level: 'warning',
      message: '.env.example file not found'
    });
  } else {
    log('✓ .env.example file exists', colors.green);
  }

  // Check .env is in .gitignore
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
    if (gitignore.includes('.env') || gitignore.includes('.env.local')) {
      log('✓ .env files are in .gitignore', colors.green);
    } else {
      issues.push({
        level: 'error',
        message: '.env files not found in .gitignore - SECURITY RISK!'
      });
    }
  }

  // Check for hardcoded secrets in code
  const srcDir = path.join(__dirname, '..', 'src');
  const dangerousPatterns = [
    /password\s*=\s*['"][^'"]+['"]/gi,
    /api[_-]?key\s*=\s*['"][^'"]+['"]/gi,
    /secret\s*=\s*['"][^'"]+['"]/gi,
    /token\s*=\s*['"][^'"]+['"]/gi,
  ];

  let foundHardcodedSecrets = false;
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        dangerousPatterns.forEach(pattern => {
          if (pattern.test(content)) {
            foundHardcodedSecrets = true;
            issues.push({
              level: 'error',
              message: `Potential hardcoded secret in ${path.relative(srcDir, fullPath)}`
            });
          }
        });
      }
    });
  }

  if (fs.existsSync(srcDir)) {
    scanDirectory(srcDir);
    if (!foundHardcodedSecrets) {
      log('✓ No hardcoded secrets detected', colors.green);
    }
  }

  return issues;
}

function checkDependencyVulnerabilities() {
  log('\n' + '='.repeat(60), colors.bright);
  log('DEPENDENCY VULNERABILITIES CHECK', colors.bright);
  log('='.repeat(60) + '\n', colors.bright);

  try {
    log('Running npm audit...', colors.blue);
    const output = execSync('npm audit --json', { encoding: 'utf-8' });
    const audit = JSON.parse(output);

    const vulnerabilities = audit.metadata?.vulnerabilities || {};
    const total = Object.values(vulnerabilities).reduce((sum, count) => sum + count, 0);

    if (total === 0) {
      log('✓ No vulnerabilities found', colors.green);
      return [];
    }

    const issues = [];
    
    if (vulnerabilities.critical > 0) {
      issues.push({
        level: 'error',
        message: `${vulnerabilities.critical} critical vulnerabilities found`
      });
    }
    
    if (vulnerabilities.high > 0) {
      issues.push({
        level: 'error',
        message: `${vulnerabilities.high} high vulnerabilities found`
      });
    }
    
    if (vulnerabilities.moderate > 0) {
      issues.push({
        level: 'warning',
        message: `${vulnerabilities.moderate} moderate vulnerabilities found`
      });
    }

    log(`\nTotal vulnerabilities: ${total}`, colors.yellow);
    log('Run "npm audit fix" to fix automatically fixable issues', colors.blue);

    return issues;
  } catch (error) {
    log('⚠ Could not run npm audit', colors.yellow);
    return [];
  }
}

function checkSecurityHeaders() {
  log('\n' + '='.repeat(60), colors.bright);
  log('SECURITY HEADERS CHECK', colors.bright);
  log('='.repeat(60) + '\n', colors.bright);

  const issues = [];
  const nextConfigPath = path.join(__dirname, '..', 'next.config.ts');

  if (!fs.existsSync(nextConfigPath)) {
    issues.push({
      level: 'warning',
      message: 'next.config.ts not found'
    });
    return issues;
  }

  const config = fs.readFileSync(nextConfigPath, 'utf-8');

  const requiredHeaders = [
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'Permissions-Policy'
  ];

  const missingHeaders = requiredHeaders.filter(header => !config.includes(header));

  if (missingHeaders.length === 0) {
    log('✓ All recommended security headers are configured', colors.green);
  } else {
    missingHeaders.forEach(header => {
      issues.push({
        level: 'warning',
        message: `Missing security header: ${header}`
      });
    });
  }

  // Check for CSP
  if (config.includes('Content-Security-Policy')) {
    log('✓ Content Security Policy is configured', colors.green);
  } else {
    issues.push({
      level: 'warning',
      message: 'Content Security Policy not configured'
    });
  }

  return issues;
}

function checkInputValidation() {
  log('\n' + '='.repeat(60), colors.bright);
  log('INPUT VALIDATION CHECK', colors.bright);
  log('='.repeat(60) + '\n', colors.bright);

  const issues = [];
  const validationPath = path.join(__dirname, '..', 'src', 'lib', 'validation.ts');

  if (!fs.existsSync(validationPath)) {
    issues.push({
      level: 'error',
      message: 'Validation utility file not found'
    });
    return issues;
  }

  const validation = fs.readFileSync(validationPath, 'utf-8');

  // Check for common validation patterns
  const validationChecks = [
    { pattern: /email/i, name: 'Email validation' },
    { pattern: /sanitize|escape/i, name: 'Input sanitization' },
    { pattern: /xss/i, name: 'XSS protection' },
  ];

  validationChecks.forEach(check => {
    if (check.pattern.test(validation)) {
      log(`✓ ${check.name} implemented`, colors.green);
    } else {
      issues.push({
        level: 'warning',
        message: `${check.name} not found in validation utilities`
      });
    }
  });

  return issues;
}

function checkAuthenticationSecurity() {
  log('\n' + '='.repeat(60), colors.bright);
  log('AUTHENTICATION SECURITY CHECK', colors.bright);
  log('='.repeat(60) + '\n', colors.bright);

  const issues = [];
  const authContextPath = path.join(__dirname, '..', 'src', 'lib', 'auth-context.tsx');

  if (!fs.existsSync(authContextPath)) {
    issues.push({
      level: 'error',
      message: 'Authentication context not found'
    });
    return issues;
  }

  const authContext = fs.readFileSync(authContextPath, 'utf-8');

  // Check for secure session handling
  if (authContext.includes('session')) {
    log('✓ Session management implemented', colors.green);
  } else {
    issues.push({
      level: 'warning',
      message: 'Session management not clearly implemented'
    });
  }

  // Check for JWT or token handling
  if (authContext.includes('token') || authContext.includes('jwt')) {
    log('✓ Token-based authentication detected', colors.green);
  }

  // Check for logout functionality
  if (authContext.includes('signOut') || authContext.includes('logout')) {
    log('✓ Logout functionality implemented', colors.green);
  } else {
    issues.push({
      level: 'error',
      message: 'Logout functionality not found'
    });
  }

  return issues;
}

function generateSecurityReport(allIssues) {
  log('\n' + '='.repeat(60), colors.bright);
  log('SECURITY AUDIT SUMMARY', colors.bright);
  log('='.repeat(60) + '\n', colors.bright);

  const errors = allIssues.filter(i => i.level === 'error');
  const warnings = allIssues.filter(i => i.level === 'warning');

  if (allIssues.length === 0) {
    log('✓ No security issues found!', colors.green);
  } else {
    if (errors.length > 0) {
      log('\nCritical Issues:', colors.red);
      errors.forEach(issue => {
        log(`  ✗ ${issue.message}`, colors.red);
      });
    }

    if (warnings.length > 0) {
      log('\nWarnings:', colors.yellow);
      warnings.forEach(issue => {
        log(`  ⚠ ${issue.message}`, colors.yellow);
      });
    }
  }

  log(`\nTotal Issues: ${allIssues.length}`, colors.blue);
  log(`  Errors: ${errors.length}`, errors.length > 0 ? colors.red : colors.green);
  log(`  Warnings: ${warnings.length}`, warnings.length > 0 ? colors.yellow : colors.green);

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: allIssues.length,
      errors: errors.length,
      warnings: warnings.length
    },
    issues: allIssues
  };

  const reportPath = path.join(__dirname, '..', 'security-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`\nSecurity report saved to: ${reportPath}`, colors.blue);
  log('='.repeat(60) + '\n', colors.bright);

  return errors.length === 0;
}

async function main() {
  log('\n' + '='.repeat(60), colors.bright);
  log('SECURITY AUDIT', colors.bright);
  log('Academic Insight PWA', colors.blue);
  log('='.repeat(60), colors.bright);

  const allIssues = [
    ...checkEnvironmentVariables(),
    ...checkDependencyVulnerabilities(),
    ...checkSecurityHeaders(),
    ...checkInputValidation(),
    ...checkAuthenticationSecurity()
  ];

  const passed = generateSecurityReport(allIssues);

  if (!passed) {
    log('\n⚠ Security audit found critical issues that should be addressed', colors.yellow);
    process.exit(1);
  } else {
    log('\n✓ Security audit passed', colors.green);
  }
}

main().catch(error => {
  log(`\nError: ${error.message}`, colors.red);
  process.exit(1);
});

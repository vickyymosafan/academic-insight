/**
 * Comprehensive Testing Script
 * Runs all tests and generates a report
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function runCommand(command, description) {
  log(`\n${colors.bright}Running: ${description}${colors.reset}`);
  log(`Command: ${command}`, colors.blue);
  
  try {
    const output = execSync(command, { 
      encoding: 'utf-8',
      stdio: 'inherit'
    });
    log(`✓ ${description} completed successfully`, colors.green);
    return { success: true, description };
  } catch (error) {
    log(`✗ ${description} failed`, colors.red);
    return { success: false, description, error: error.message };
  }
}

async function main() {
  log('\n' + '='.repeat(60), colors.bright);
  log('COMPREHENSIVE TEST SUITE', colors.bright);
  log('Academic Insight PWA', colors.blue);
  log('='.repeat(60) + '\n', colors.bright);

  const results = [];
  const startTime = Date.now();

  // 1. TypeScript Type Checking
  results.push(runCommand(
    'npx tsc --noEmit',
    'TypeScript Type Checking'
  ));

  // 2. ESLint
  results.push(runCommand(
    'npx eslint . --ext .ts,.tsx --max-warnings 0',
    'ESLint Code Quality Check'
  ));

  // 3. Unit Tests
  results.push(runCommand(
    'npm run test -- --run --coverage',
    'Unit Tests with Coverage'
  ));

  // 4. Build Test
  results.push(runCommand(
    'npm run build',
    'Production Build Test'
  ));

  // 5. E2E Tests (if Playwright is configured)
  if (fs.existsSync('playwright.config.ts')) {
    results.push(runCommand(
      'npx playwright test --reporter=list',
      'End-to-End Tests'
    ));
  }

  // Generate Report
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  log('\n' + '='.repeat(60), colors.bright);
  log('TEST RESULTS SUMMARY', colors.bright);
  log('='.repeat(60) + '\n', colors.bright);

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  results.forEach(result => {
    const icon = result.success ? '✓' : '✗';
    const color = result.success ? colors.green : colors.red;
    log(`${icon} ${result.description}`, color);
  });

  log(`\nTotal Tests: ${results.length}`, colors.blue);
  log(`Passed: ${passed}`, colors.green);
  log(`Failed: ${failed}`, failed > 0 ? colors.red : colors.green);
  log(`Duration: ${duration}s`, colors.blue);

  // Save report to file
  const report = {
    timestamp: new Date().toISOString(),
    duration: `${duration}s`,
    results: results.map(r => ({
      description: r.description,
      success: r.success,
      error: r.error || null
    })),
    summary: {
      total: results.length,
      passed,
      failed
    }
  };

  const reportPath = path.join(__dirname, '..', 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\nReport saved to: ${reportPath}`, colors.blue);

  log('\n' + '='.repeat(60) + '\n', colors.bright);

  // Exit with error code if any tests failed
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  log(`\nFatal error: ${error.message}`, colors.red);
  process.exit(1);
});

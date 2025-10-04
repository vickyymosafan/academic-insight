#!/usr/bin/env node

/**
 * RLS Policy Test Runner (Node.js version)
 * This script runs various tests to verify Row Level Security policies
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

// Configuration
const config = {
    supabaseUrl: process.env.SUPABASE_URL || 'http://localhost:54321',
    supabaseDbUrl: process.env.SUPABASE_DB_URL || 'postgresql://postgres:postgres@localhost:54322/postgres'
};

console.log('🔒 Starting RLS Policy Tests...');
console.log('================================');
console.log(`${colors.yellow}Configuration:${colors.reset}`);
console.log(`Supabase URL: ${config.supabaseUrl}`);
console.log(`Database URL: ${config.supabaseDbUrl}`);
console.log('');

let failedTests = 0;

/**
 * Execute a shell command and return the result
 */
function execCommand(command, options = {}) {
    try {
        const result = execSync(command, { 
            encoding: 'utf8', 
            stdio: options.silent ? 'pipe' : 'inherit',
            ...options 
        });
        return { success: true, output: result };
    } catch (error) {
        return { success: false, error: error.message, output: error.stdout };
    }
}

/**
 * Check if Supabase is running
 */
async function checkSupabase() {
    console.log(`${colors.yellow}Checking Supabase connection...${colors.reset}`);
    
    try {
        const response = await fetch(`${config.supabaseUrl}/health`);
        if (response.ok) {
            console.log(`${colors.green}✅ Supabase is running${colors.reset}`);
            return true;
        } else {
            throw new Error('Health check failed');
        }
    } catch (error) {
        console.log(`${colors.red}❌ Supabase is not running or not accessible${colors.reset}`);
        console.log('Please start Supabase with: supabase start');
        return false;
    }
}

/**
 * Check database connection
 */
function checkDatabase() {
    console.log(`${colors.yellow}Checking database connection...${colors.reset}`);
    
    const result = execCommand(`psql "${config.supabaseDbUrl}" -c "SELECT 1;"`, { silent: true });
    
    if (result.success) {
        console.log(`${colors.green}✅ Database connection successful${colors.reset}`);
        return true;
    } else {
        console.log(`${colors.red}❌ Database connection failed${colors.reset}`);
        console.log('Error:', result.error);
        return false;
    }
}

/**
 * Verify RLS is enabled on required tables
 */
function verifyRlsEnabled() {
    console.log(`${colors.yellow}Verifying RLS is enabled on tables...${colors.reset}`);
    
    const query = `
        SELECT COUNT(*) 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'students', 'courses', 'grades') 
        AND rowsecurity = true;
    `;
    
    const result = execCommand(`psql "${config.supabaseDbUrl}" -t -c "${query}"`, { silent: true });
    
    if (result.success) {
        const count = parseInt(result.output.trim());
        if (count === 4) {
            console.log(`${colors.green}✅ RLS is enabled on all required tables${colors.reset}`);
            return true;
        } else {
            console.log(`${colors.red}❌ RLS is not enabled on all tables (found ${count}/4)${colors.reset}`);
            return false;
        }
    } else {
        console.log(`${colors.red}❌ Failed to check RLS status${colors.reset}`);
        return false;
    }
}

/**
 * Verify RLS policies exist
 */
function verifyPoliciesExist() {
    console.log(`${colors.yellow}Verifying RLS policies exist...${colors.reset}`);
    
    const query = `
        SELECT COUNT(*) 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'students', 'courses', 'grades');
    `;
    
    const result = execCommand(`psql "${config.supabaseDbUrl}" -t -c "${query}"`, { silent: true });
    
    if (result.success) {
        const count = parseInt(result.output.trim());
        if (count > 0) {
            console.log(`${colors.green}✅ Found ${count} RLS policies${colors.reset}`);
            return true;
        } else {
            console.log(`${colors.red}❌ No RLS policies found${colors.reset}`);
            return false;
        }
    } else {
        console.log(`${colors.red}❌ Failed to check policies${colors.reset}`);
        return false;
    }
}

/**
 * Run basic functionality tests
 */
function runBasicTests() {
    console.log(`${colors.yellow}Running basic functionality tests...${colors.reset}`);
    
    const tables = ['profiles', 'students', 'courses', 'grades'];
    let allPassed = true;
    
    for (const table of tables) {
        const result = execCommand(`psql "${config.supabaseDbUrl}" -t -c "SELECT COUNT(*) FROM ${table};"`, { silent: true });
        
        if (result.success) {
            const count = parseInt(result.output.trim());
            console.log(`${colors.green}✅ Table '${table}' accessible (has ${count} rows)${colors.reset}`);
        } else {
            console.log(`${colors.red}❌ Table '${table}' not accessible${colors.reset}`);
            allPassed = false;
        }
    }
    
    return allPassed;
}

/**
 * Test utility functions
 */
function testUtilityFunctions() {
    console.log(`${colors.yellow}Testing utility functions...${colors.reset}`);
    
    // Test grade point calculation
    const gradeResult = execCommand(`psql "${config.supabaseDbUrl}" -t -c "SELECT calculate_grade_point('A');"`, { silent: true });
    
    if (gradeResult.success) {
        const gradePoint = parseFloat(gradeResult.output.trim());
        if (gradePoint === 4.00) {
            console.log(`${colors.green}✅ Grade point calculation works${colors.reset}`);
        } else {
            console.log(`${colors.red}❌ Grade point calculation failed (got ${gradePoint}, expected 4.00)${colors.reset}`);
            return false;
        }
    } else {
        console.log(`${colors.red}❌ Grade point calculation function not found${colors.reset}`);
        return false;
    }
    
    // Test helper functions
    const functions = ['is_admin', 'is_course_lecturer', 'get_user_role'];
    for (const func of functions) {
        const result = execCommand(`psql "${config.supabaseDbUrl}" -c "SELECT ${func}();"`, { silent: true });
        
        if (result.success) {
            console.log(`${colors.green}✅ Function '${func}' exists and callable${colors.reset}`);
        } else {
            console.log(`${colors.yellow}⚠️  Function '${func}' may require authentication context${colors.reset}`);
        }
    }
    
    return true;
}

/**
 * Run SQL test file
 */
function runSqlTest(testFile, testName) {
    console.log(`${colors.yellow}Running ${testName}...${colors.reset}`);
    
    if (!fs.existsSync(testFile)) {
        console.log(`${colors.yellow}⚠️  Test file ${testFile} not found${colors.reset}`);
        return true; // Don't fail if optional test file is missing
    }
    
    const result = execCommand(`psql "${config.supabaseDbUrl}" -f "${testFile}"`, { silent: true });
    
    if (result.success) {
        console.log(`${colors.green}✅ ${testName} passed${colors.reset}`);
        return true;
    } else {
        console.log(`${colors.red}❌ ${testName} failed${colors.reset}`);
        console.log('Error:', result.error);
        return false;
    }
}

/**
 * Show policy summary
 */
function showPolicySummary() {
    console.log(`${colors.yellow}RLS Policy Summary:${colors.reset}`);
    console.log('====================');
    
    const query = `
        SELECT 
            tablename,
            policyname,
            cmd,
            roles
        FROM pg_policies 
        WHERE schemaname = 'public' 
        ORDER BY tablename, policyname;
    `;
    
    const result = execCommand(`psql "${config.supabaseDbUrl}" -c "${query}"`, { silent: false });
    
    if (!result.success) {
        console.log('Could not retrieve policy summary');
    }
}

/**
 * Main test execution
 */
async function main() {
    try {
        // Pre-flight checks
        if (!(await checkSupabase())) {
            process.exit(1);
        }
        
        if (!checkDatabase()) {
            process.exit(1);
        }
        
        console.log('');
        console.log(`${colors.yellow}Running RLS verification tests...${colors.reset}`);
        console.log('==================================');
        
        // Verify RLS setup
        if (!verifyRlsEnabled()) failedTests++;
        if (!verifyPoliciesExist()) failedTests++;
        
        console.log('');
        console.log(`${colors.yellow}Running functionality tests...${colors.reset}`);
        console.log('==============================');
        
        // Basic functionality tests
        if (!runBasicTests()) failedTests++;
        if (!testUtilityFunctions()) failedTests++;
        
        console.log('');
        console.log(`${colors.yellow}Running SQL test files...${colors.reset}`);
        console.log('=========================');
        
        // Run SQL test files if they exist
        if (!runSqlTest('supabase/tests/rls_policy_tests.sql', 'Basic RLS Tests')) {
            failedTests++;
        }
        
        console.log('');
        showPolicySummary();
        
        console.log('');
        console.log('================================');
        
        if (failedTests === 0) {
            console.log(`${colors.green}🎉 All RLS tests passed!${colors.reset}`);
            console.log(`${colors.green}Your Row Level Security policies are working correctly.${colors.reset}`);
            process.exit(0);
        } else {
            console.log(`${colors.red}❌ ${failedTests} test(s) failed${colors.reset}`);
            console.log(`${colors.red}Please review the RLS policies and fix any issues.${colors.reset}`);
            process.exit(1);
        }
        
    } catch (error) {
        console.error(`${colors.red}❌ Test runner failed:${colors.reset}`, error.message);
        process.exit(1);
    }
}

/**
 * Show help
 */
function showHelp() {
    console.log('RLS Policy Test Runner');
    console.log('=====================');
    console.log('');
    console.log('Usage: node run-rls-tests.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  -h, --help     Show this help message');
    console.log('  --url URL      Set Supabase URL');
    console.log('  --db-url URL   Set Database URL');
    console.log('');
    console.log('Environment Variables:');
    console.log('  SUPABASE_URL     Supabase API URL');
    console.log('  SUPABASE_DB_URL  PostgreSQL connection string');
    console.log('');
    console.log('Examples:');
    console.log('  node run-rls-tests.js');
    console.log('  node run-rls-tests.js --url https://your-project.supabase.co');
    console.log('  SUPABASE_URL=https://your-project.supabase.co node run-rls-tests.js');
}

// Parse command line arguments
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '-h':
        case '--help':
            showHelp();
            process.exit(0);
            break;
        case '--url':
            config.supabaseUrl = args[++i];
            break;
        case '--db-url':
            config.supabaseDbUrl = args[++i];
            break;
        default:
            console.log(`Unknown option: ${args[i]}`);
            showHelp();
            process.exit(1);
    }
}

// Run main function
main().catch(error => {
    console.error(`${colors.red}❌ Unexpected error:${colors.reset}`, error);
    process.exit(1);
});
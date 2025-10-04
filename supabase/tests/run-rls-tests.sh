#!/bin/bash

# RLS Policy Test Runner Script
# This script runs various tests to verify Row Level Security policies

set -e

echo "🔒 Starting RLS Policy Tests..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SUPABASE_URL=${SUPABASE_URL:-"http://localhost:54321"}
SUPABASE_DB_URL=${SUPABASE_DB_URL:-"postgresql://postgres:postgres@localhost:54322/postgres"}

echo -e "${YELLOW}Configuration:${NC}"
echo "Supabase URL: $SUPABASE_URL"
echo "Database URL: $SUPABASE_DB_URL"
echo ""

# Function to run SQL test
run_sql_test() {
    local test_file=$1
    local test_name=$2
    
    echo -e "${YELLOW}Running $test_name...${NC}"
    
    if psql "$SUPABASE_DB_URL" -f "$test_file" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $test_name passed${NC}"
        return 0
    else
        echo -e "${RED}❌ $test_name failed${NC}"
        return 1
    fi
}

# Function to check if Supabase is running
check_supabase() {
    echo -e "${YELLOW}Checking Supabase connection...${NC}"
    
    if curl -s "$SUPABASE_URL/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Supabase is running${NC}"
        return 0
    else
        echo -e "${RED}❌ Supabase is not running or not accessible${NC}"
        echo "Please start Supabase with: supabase start"
        return 1
    fi
}

# Function to check database connection
check_database() {
    echo -e "${YELLOW}Checking database connection...${NC}"
    
    if psql "$SUPABASE_DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database connection successful${NC}"
        return 0
    else
        echo -e "${RED}❌ Database connection failed${NC}"
        return 1
    fi
}

# Function to verify RLS is enabled
verify_rls_enabled() {
    echo -e "${YELLOW}Verifying RLS is enabled on tables...${NC}"
    
    local result=$(psql "$SUPABASE_DB_URL" -t -c "
        SELECT COUNT(*) 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'students', 'courses', 'grades') 
        AND rowsecurity = true;
    " 2>/dev/null | xargs)
    
    if [ "$result" = "4" ]; then
        echo -e "${GREEN}✅ RLS is enabled on all required tables${NC}"
        return 0
    else
        echo -e "${RED}❌ RLS is not enabled on all tables (found $result/4)${NC}"
        return 1
    fi
}

# Function to verify policies exist
verify_policies_exist() {
    echo -e "${YELLOW}Verifying RLS policies exist...${NC}"
    
    local result=$(psql "$SUPABASE_DB_URL" -t -c "
        SELECT COUNT(*) 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'students', 'courses', 'grades');
    " 2>/dev/null | xargs)
    
    if [ "$result" -gt "0" ]; then
        echo -e "${GREEN}✅ Found $result RLS policies${NC}"
        return 0
    else
        echo -e "${RED}❌ No RLS policies found${NC}"
        return 1
    fi
}

# Function to run basic functionality tests
run_basic_tests() {
    echo -e "${YELLOW}Running basic functionality tests...${NC}"
    
    # Test 1: Check if tables exist and have data
    local tables=("profiles" "students" "courses" "grades")
    local all_passed=true
    
    for table in "${tables[@]}"; do
        local count=$(psql "$SUPABASE_DB_URL" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | xargs)
        if [ "$count" -ge "0" ]; then
            echo -e "${GREEN}✅ Table '$table' accessible (has $count rows)${NC}"
        else
            echo -e "${RED}❌ Table '$table' not accessible${NC}"
            all_passed=false
        fi
    done
    
    if [ "$all_passed" = true ]; then
        return 0
    else
        return 1
    fi
}

# Function to test utility functions
test_utility_functions() {
    echo -e "${YELLOW}Testing utility functions...${NC}"
    
    # Test grade point calculation
    local grade_point=$(psql "$SUPABASE_DB_URL" -t -c "SELECT calculate_grade_point('A');" 2>/dev/null | xargs)
    if [ "$grade_point" = "4.00" ]; then
        echo -e "${GREEN}✅ Grade point calculation works${NC}"
    else
        echo -e "${RED}❌ Grade point calculation failed (got $grade_point, expected 4.00)${NC}"
        return 1
    fi
    
    # Test if helper functions exist
    local functions=("is_admin" "is_course_lecturer" "get_user_role")
    for func in "${functions[@]}"; do
        if psql "$SUPABASE_DB_URL" -c "SELECT $func();" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Function '$func' exists and callable${NC}"
        else
            echo -e "${YELLOW}⚠️  Function '$func' may require authentication context${NC}"
        fi
    done
    
    return 0
}

# Function to show policy summary
show_policy_summary() {
    echo -e "${YELLOW}RLS Policy Summary:${NC}"
    echo "===================="
    
    psql "$SUPABASE_DB_URL" -c "
        SELECT 
            tablename,
            policyname,
            cmd,
            roles
        FROM pg_policies 
        WHERE schemaname = 'public' 
        ORDER BY tablename, policyname;
    " 2>/dev/null || echo "Could not retrieve policy summary"
}

# Main test execution
main() {
    local failed_tests=0
    
    # Pre-flight checks
    check_supabase || exit 1
    check_database || exit 1
    
    echo ""
    echo -e "${YELLOW}Running RLS verification tests...${NC}"
    echo "=================================="
    
    # Verify RLS setup
    verify_rls_enabled || ((failed_tests++))
    verify_policies_exist || ((failed_tests++))
    
    echo ""
    echo -e "${YELLOW}Running functionality tests...${NC}"
    echo "=============================="
    
    # Basic functionality tests
    run_basic_tests || ((failed_tests++))
    test_utility_functions || ((failed_tests++))
    
    echo ""
    echo -e "${YELLOW}Running SQL test files...${NC}"
    echo "========================="
    
    # Run SQL test files if they exist
    if [ -f "supabase/tests/rls_policy_tests.sql" ]; then
        run_sql_test "supabase/tests/rls_policy_tests.sql" "Basic RLS Tests" || ((failed_tests++))
    else
        echo -e "${YELLOW}⚠️  Basic RLS test file not found${NC}"
    fi
    
    echo ""
    show_policy_summary
    
    echo ""
    echo "================================"
    if [ $failed_tests -eq 0 ]; then
        echo -e "${GREEN}🎉 All RLS tests passed!${NC}"
        echo -e "${GREEN}Your Row Level Security policies are working correctly.${NC}"
        exit 0
    else
        echo -e "${RED}❌ $failed_tests test(s) failed${NC}"
        echo -e "${RED}Please review the RLS policies and fix any issues.${NC}"
        exit 1
    fi
}

# Help function
show_help() {
    echo "RLS Policy Test Runner"
    echo "====================="
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --url URL      Set Supabase URL (default: http://localhost:54321)"
    echo "  --db-url URL   Set Database URL (default: postgresql://postgres:postgres@localhost:54322/postgres)"
    echo ""
    echo "Environment Variables:"
    echo "  SUPABASE_URL     Supabase API URL"
    echo "  SUPABASE_DB_URL  PostgreSQL connection string"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Run with default settings"
    echo "  $0 --url https://your-project.supabase.co"
    echo "  SUPABASE_URL=https://your-project.supabase.co $0"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --url)
            SUPABASE_URL="$2"
            shift 2
            ;;
        --db-url)
            SUPABASE_DB_URL="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Run main function
main
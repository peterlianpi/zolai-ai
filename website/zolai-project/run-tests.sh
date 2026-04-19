#!/bin/bash

# Myanmar Internet Review - Test Execution Script
# Team Epsilon - Testing and Quality Assurance

set -e

echo "🧪 Myanmar Internet Review - Test Suite Execution"
echo "================================================"

# Check if Playwright is installed
if ! npx playwright --version > /dev/null 2>&1; then
    echo "📦 Installing Playwright browsers..."
    npx playwright install --with-deps
fi

# Check if application is built
if [ ! -d ".next" ]; then
    echo "🏗️  Building application..."
    bun run build
fi

# Check if test data is seeded (optional)
echo "🌱 Preparing test data..."
bun run test:seed || echo "⚠️  Test data seeding failed (may be normal)"

# Function to run test suite with reporting
run_test_suite() {
    local suite_name=$1
    local test_path=$2
    
    echo ""
    echo "🔍 Running $suite_name tests..."
    echo "-------------------------------------------"
    
    if npx playwright test "$test_path" --reporter=list; then
        echo "✅ $suite_name tests PASSED"
    else
        echo "❌ $suite_name tests FAILED"
        return 1
    fi
}

# Initialize test results tracking
failed_suites=()

# Run test suites in order of priority
echo ""
echo "Starting test execution in priority order:"

# 1. Authentication tests (critical)
if ! run_test_suite "Authentication" "tests/auth/"; then
    failed_suites+=("Authentication")
fi

# 2. API Security tests (critical)  
if ! run_test_suite "API Security" "tests/api/api-security.spec.ts"; then
    failed_suites+=("API Security")
fi

# 3. API Endpoints tests (high priority)
if ! run_test_suite "API Endpoints" "tests/api/api-endpoints.spec.ts"; then
    failed_suites+=("API Endpoints")
fi

# 4. Admin functionality tests (high priority)
if ! run_test_suite "Admin Functionality" "tests/admin/"; then
    failed_suites+=("Admin Functionality")
fi

# 5. Critical user journeys (high priority)
if ! run_test_suite "User Journeys" "tests/e2e/"; then
    failed_suites+=("User Journeys")
fi

# 6. Performance tests (medium priority)
if ! run_test_suite "Performance" "tests/performance/"; then
    failed_suites+=("Performance")
fi

# Generate test report
echo ""
echo "📊 Generating test report..."
npx playwright show-report --host=127.0.0.1 > /dev/null 2>&1 &
REPORT_PID=$!

# Summary
echo ""
echo "📋 TEST EXECUTION SUMMARY"
echo "========================="

if [ ${#failed_suites[@]} -eq 0 ]; then
    echo "🎉 ALL TEST SUITES PASSED!"
    echo ""
    echo "✅ Authentication & Authorization"
    echo "✅ API Security & Validation" 
    echo "✅ Admin Functionality"
    echo "✅ Critical User Journeys"
    echo "✅ Performance Validation"
    echo ""
    echo "The Myanmar Internet Review application is ready for deployment."
    exit 0
else
    echo "⚠️  SOME TESTS FAILED"
    echo ""
    echo "Failed test suites:"
    for suite in "${failed_suites[@]}"; do
        echo "❌ $suite"
    done
    echo ""
    echo "Please review the test output above and fix failing tests before deployment."
    exit 1
fi

# Cleanup
trap "kill $REPORT_PID 2>/dev/null || true" EXIT

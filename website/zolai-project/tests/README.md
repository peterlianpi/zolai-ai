# Zolai AI - Testing Suite

## Overview

Comprehensive testing strategy covering E2E, API, security, and performance testing using Playwright and TypeScript.

## Test Structure

```
tests/
├── auth/                    # Authentication & authorization tests
├── admin/                   # Admin functionality tests  
├── api/                     # API endpoint tests
├── e2e/                     # Critical user journey tests
├── performance/             # Performance & load tests
├── security/                # Security validation tests
├── fixtures/                # Test data and authentication states
└── utils/                   # Test helpers and utilities
```

## Running Tests

### Basic Commands
```bash
# Run all tests
npx playwright test

# Run specific test suite
npx playwright test tests/auth/
npx playwright test tests/api/

# Run tests with UI
npx playwright test --ui

# Run tests in headed mode
npx playwright test --headed

# Run specific test file
npx playwright test tests/auth/authentication.spec.ts

# Run tests matching pattern
npx playwright test -g "should login successfully"
```

### Test Reports
```bash
# Generate HTML report
npx playwright show-report

# Run tests with detailed logging
npx playwright test --reporter=list

# Generate coverage report (when implemented)
npx playwright test --reporter=html
```

## Test Categories

### 1. Authentication Tests (`tests/auth/`)
- User registration flow
- Login/logout functionality  
- Password reset process
- Email verification
- 2FA setup and validation
- Session management
- Role-based access control

### 2. API Tests (`tests/api/`)
- Endpoint functionality validation
- Input validation and sanitization
- Authentication and authorization
- Rate limiting enforcement  
- Error handling and response formats
- Security vulnerability testing

### 3. Admin Tests (`tests/admin/`)
- Dashboard functionality
- User management operations
- Content moderation tools
- Security monitoring features
- System settings management
- Audit logging verification

### 4. End-to-End Tests (`tests/e2e/`)
- Complete user registration journey
- Content creation and publishing workflow
- Comment and interaction flows
- Search and navigation
- Mobile responsive behavior
- Internationalization (Myanmar)
- Error handling and recovery

### 5. Performance Tests (`tests/performance/`)
- Page load time validation
- API response time monitoring
- Memory usage assessment
- Concurrent user handling
- Database query optimization
- Caching effectiveness

### 6. Security Tests (`tests/security/`)
- XSS prevention validation
- SQL injection protection
- CSRF token enforcement  
- File upload security
- Input sanitization
- Security header verification

## Test Configuration

### Environment Setup
Tests require the following environment:
- Application built and running (`bun run build && bun run start`)
- Test database with seeded data
- Authentication test users created
- Media upload directories configured

### Browser Support
- Chromium (primary)
- Firefox 
- Safari/WebKit
- Mobile Chrome
- Mobile Safari

### Authentication States
Pre-configured authentication states stored in `tests/fixtures/.auth/`:
- `user.json` - Regular authenticated user
- `admin.json` - Admin user with elevated privileges

## Test Data Management

### Test Users
- `test-user@example.com` - Regular user account
- `admin@example.com` - Administrator account  

### Cleanup Strategy
- Tests use isolated data where possible
- Cleanup utilities in `test-helpers.ts`
- Database cleanup after test runs

## Performance Budgets

### Page Load Times
- Homepage: < 2 seconds
- Dashboard: < 3 seconds  
- Search results: < 1.5 seconds

### API Response Times  
- Health check: < 200ms
- Content endpoints: < 500ms
- Admin endpoints: < 1 second

### Core Web Vitals
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

## Security Test Coverage

### Authentication Security
- Brute force protection
- Session fixation prevention
- Password strength enforcement
- Account lockout policies

### Input Validation
- XSS attack prevention
- SQL injection protection
- Command injection blocking
- Path traversal prevention

### File Upload Security
- File type validation
- Size limit enforcement
- Content scanning
- Path sanitization

## Continuous Integration

### GitHub Actions Integration
```yaml
# Example CI configuration
- name: Install Playwright
  run: npx playwright install --with-deps
  
- name: Run tests
  run: npx playwright test
  
- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

### Test Execution Strategy
- **Pull Requests**: Core functionality tests
- **Main Branch**: Full test suite including performance
- **Nightly**: Extended security and load tests
- **Pre-Production**: Complete validation suite

## Known Issues & Limitations

### Current Gaps
1. **Email Testing**: Mock email service needed for verification tests
2. **File Uploads**: Requires actual file fixtures for upload tests  
3. **Database Seeding**: Test data setup automation needed
4. **Payment Integration**: Not applicable for current scope

### Planned Improvements
1. **Visual Regression Testing**: Screenshot comparison tests
2. **Accessibility Testing**: ARIA and WCAG compliance validation
3. **API Contract Testing**: OpenAPI schema validation
4. **Load Testing**: Higher concurrent user simulation

## Contributing to Tests

### Adding New Tests
1. Create test files following naming convention: `*.spec.ts`
2. Use test helpers from `utils/test-helpers.ts`
3. Follow existing patterns for authentication and cleanup
4. Add appropriate `data-testid` attributes to UI elements

### Test Quality Guidelines
- Write descriptive test names explaining the scenario
- Use Page Object Model for complex UI interactions
- Implement proper wait strategies (avoid hard sleeps)
- Clean up test data after each test
- Use appropriate assertions with clear error messages

### Debugging Tests
```bash
# Run tests in debug mode
npx playwright test --debug

# Run with trace viewer
npx playwright test --trace on

# Run single test with full logging
npx playwright test tests/auth/authentication.spec.ts --reporter=line
```

## Test Metrics & Monitoring

### Coverage Goals
- **E2E Coverage**: 90% of critical user journeys  
- **API Coverage**: 100% of public endpoints
- **Security Coverage**: All OWASP Top 10 scenarios
- **Performance Coverage**: Key user-facing pages

### Success Criteria
- All tests pass in CI/CD pipeline
- Performance budgets maintained
- Security tests prevent regressions
- Cross-browser compatibility verified

For detailed implementation guidance, see individual test files and the main project documentation.

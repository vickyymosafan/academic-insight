# End-to-End Testing Documentation

## Overview

This document describes the end-to-end (E2E) testing setup for the Academic Insight PWA using Playwright. E2E tests simulate real user interactions and test the application as a whole.

## Testing Stack

- **Playwright**: Modern E2E testing framework
- **TypeScript**: Type-safe test writing
- **Multiple Browsers**: Chromium, Firefox, WebKit
- **Mobile Testing**: iOS and Android viewports

## Setup

### Installation

Playwright is already installed. To install browsers:

```bash
npx playwright install
```

### Configuration

The Playwright configuration is in `playwright.config.ts`:

- **Test Directory**: `./e2e`
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure only
- **Traces**: On first retry

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test e2e/login.spec.ts
```

### Run tests on specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run tests on mobile
```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## Test Files

### Login Tests (`e2e/login.spec.ts`)

Tests for login functionality:
- ✅ Displays login page with all elements
- ✅ Has proper input types and attributes
- ✅ Allows typing in email and password fields
- ✅ Shows loading state when submitting
- ✅ Is responsive on mobile viewport
- ✅ Has proper accessibility attributes

### PWA Tests (`e2e/pwa.spec.ts`)

Tests for PWA functionality:
- ✅ Has PWA manifest
- ✅ Has service worker registered
- ✅ Has proper meta tags for PWA
- ✅ Has app icons
- ✅ Shows offline indicator when offline
- ✅ Is installable as PWA

### Dashboard Tests (`e2e/dashboard.spec.ts`)

Tests for dashboard navigation:
- ✅ Displays dashboard layout
- ✅ Is responsive on different screen sizes
- ✅ Has proper page title
- ⏭️ Displays statistics cards (requires auth)
- ⏭️ Displays charts (requires auth)

## Writing E2E Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/path');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const button = page.getByRole('button', { name: 'Click me' });
    
    // Act
    await button.click();
    
    // Assert
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

### Locating Elements

Playwright recommends using user-facing attributes:

```typescript
// By role (best)
page.getByRole('button', { name: 'Submit' })
page.getByRole('heading', { name: 'Title' })

// By label (for forms)
page.getByLabel('Email')
page.getByLabel('Password')

// By text
page.getByText('Welcome')

// By test ID (last resort)
page.getByTestId('submit-button')
```

### Waiting for Elements

```typescript
// Wait for element to be visible
await expect(page.getByText('Loaded')).toBeVisible();

// Wait for network to be idle
await page.waitForLoadState('networkidle');

// Wait for specific timeout
await page.waitForTimeout(1000);

// Wait for navigation
await page.waitForURL('/dashboard');
```

### Testing Forms

```typescript
test('should submit form', async ({ page }) => {
  // Fill form
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password123');
  
  // Submit
  await page.getByRole('button', { name: 'Submit' }).click();
  
  // Verify
  await expect(page).toHaveURL('/dashboard');
});
```

### Testing Responsive Design

```typescript
test('should be responsive', async ({ page }) => {
  // Desktop
  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(page.getByText('Desktop View')).toBeVisible();
  
  // Mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.getByText('Mobile View')).toBeVisible();
});
```

### Testing PWA Features

```typescript
test('should work offline', async ({ page, context }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Go offline
  await context.setOffline(true);
  
  // Navigate
  await page.goto('/dashboard');
  
  // Should still work
  await expect(page.getByText('Offline Mode')).toBeVisible();
  
  // Go back online
  await context.setOffline(false);
});
```

### Testing Authentication

```typescript
test.describe('Authenticated tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill('test@university.edu');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /masuk/i }).click();
    await page.waitForURL('/dashboard');
  });

  test('should access protected route', async ({ page }) => {
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Dashboard')).toBeVisible();
  });
});
```

## Best Practices

### 1. Use Page Object Model

Create reusable page objects:

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/auth/login');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: /masuk/i }).click();
  }
}

// In test
const loginPage = new LoginPage(page);
await loginPage.goto();
await loginPage.login('test@example.com', 'password123');
```

### 2. Use Fixtures for Setup

```typescript
import { test as base } from '@playwright/test';

const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Login
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill('test@university.edu');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /masuk/i }).click();
    await page.waitForURL('/dashboard');
    
    await use(page);
  },
});

test('should access dashboard', async ({ authenticatedPage }) => {
  await expect(authenticatedPage).toHaveURL('/dashboard');
});
```

### 3. Handle Flaky Tests

```typescript
// Retry flaky tests
test('flaky test', async ({ page }) => {
  // test code
}).retry(2);

// Use soft assertions
await expect.soft(page.getByText('Optional')).toBeVisible();
```

### 4. Clean Up After Tests

```typescript
test.afterEach(async ({ page }) => {
  // Logout or clean up
  await page.goto('/auth/logout');
});
```

## Debugging

### Visual Debugging

```bash
# Run with UI mode
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug
```

### Screenshots and Videos

Playwright automatically captures:
- Screenshots on failure
- Videos on first retry
- Traces on first retry

View test results:
```bash
npx playwright show-report
```

### Console Logs

```typescript
page.on('console', msg => console.log(msg.text()));
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Known Limitations

1. **Authentication**: Some tests are skipped because they require authentication. Implement test authentication setup to enable these tests.

2. **Real-time Features**: Testing real-time updates requires special setup with WebSocket mocking or test database.

3. **Service Worker**: Service worker testing can be flaky. Use appropriate waits and retries.

4. **Mobile Testing**: Some PWA features work differently on real mobile devices vs. emulated viewports.

## Future Improvements

- [ ] Implement authentication fixtures
- [ ] Add visual regression testing
- [ ] Add performance testing
- [ ] Add accessibility testing with axe-playwright
- [ ] Add API mocking with MSW
- [ ] Add database seeding for consistent test data
- [ ] Add cross-browser screenshot comparison

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Testing PWAs with Playwright](https://playwright.dev/docs/pwa)

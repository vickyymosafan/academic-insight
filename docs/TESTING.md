# Testing Documentation - Academic Insight PWA

## Overview

This document describes the testing setup and strategy for the Academic Insight PWA application. The project uses Jest and React Testing Library for unit and integration testing.

## Testing Stack

- **Jest**: JavaScript testing framework
- **React Testing Library**: Testing utilities for React components
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom Jest matchers for DOM assertions

## Test Structure

```
src/
├── __mocks__/
│   └── supabase.ts          # Mock Supabase client and data
├── lib/
│   └── __tests__/
│       └── auth-context.test.tsx
├── components/
│   ├── auth/
│   │   └── __tests__/
│   │       └── LoginForm.test.tsx
│   └── dashboard/
│       └── __tests__/
│           └── DashboardOverview.test.tsx
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- LoginForm.test.tsx
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="should render"
```

## Test Coverage

The project aims for 80% code coverage for critical components:

- **AuthContext**: Authentication state management
- **LoginForm**: User login functionality
- **DashboardOverview**: Dashboard statistics display

Current coverage:
- Branches: 80%+
- Functions: 80%+
- Lines: 80%+
- Statements: 80%+

## Writing Tests

### Basic Test Structure

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Clicked')).toBeInTheDocument();
    });
  });
});
```

### Mocking Supabase

The project includes a mock Supabase client in `src/__mocks__/supabase.ts`:

```typescript
import { createMockSupabaseClient } from '@/__mocks__/supabase';

// In your test file
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      // ... other methods
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      // ... other methods
    })),
  },
}));
```

### Testing Async Operations

```typescript
it('should load data asynchronously', async () => {
  mockSupabaseClient.from.mockReturnValue({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: { id: '1', name: 'Test' },
      error: null,
    }),
  });

  render(<MyComponent />);

  await waitFor(() => {
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Testing Error States

```typescript
it('should display error message on failure', async () => {
  mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
    data: { user: null },
    error: { message: 'Invalid credentials' },
  });

  render(<LoginForm />);

  const submitButton = screen.getByRole('button', { name: /login/i });
  await user.click(submitButton);

  await waitFor(() => {
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
```

## Test Files

### AuthContext Tests (`src/lib/__tests__/auth-context.test.tsx`)

Tests for authentication context:
- ✅ Provides auth context to children
- ✅ Loads user profile on initial session
- ✅ Handles session errors gracefully
- ✅ Signs in user successfully
- ✅ Handles invalid credentials error
- ✅ Signs out user successfully
- ✅ Throws error when used outside provider

### LoginForm Tests (`src/components/auth/__tests__/LoginForm.test.tsx`)

Tests for login form component:
- ✅ Renders login form with all elements
- ✅ Has email and password inputs
- ✅ Updates input values when typing
- ✅ Submits form with valid credentials
- ✅ Displays error message on login failure
- ✅ Disables form inputs while loading
- ✅ Has proper accessibility attributes

### DashboardOverview Tests (`src/components/dashboard/__tests__/DashboardOverview.test.tsx`)

Tests for dashboard overview component:
- ✅ Renders all statistics cards
- ✅ Displays correct statistics values
- ✅ Renders all chart containers
- ✅ Shows realtime connection indicator
- ✅ Hides realtime indicator when closed
- ✅ Displays error message when data fetch fails
- ✅ Calls refetch when retry button clicked
- ✅ Shows loading state for statistics
- ✅ Shows disconnected state and reconnect button
- ✅ Shows info message when no students data
- ✅ Displays last update time

## Best Practices

### 1. Use Testing Library Queries

Prefer queries in this order:
1. `getByRole` - Most accessible
2. `getByLabelText` - For form elements
3. `getByText` - For non-interactive elements
4. `getByTestId` - Last resort

### 2. Avoid Implementation Details

❌ Bad:
```typescript
expect(component.state.isLoading).toBe(true);
```

✅ Good:
```typescript
expect(screen.getByText('Loading...')).toBeInTheDocument();
```

### 3. Use `waitFor` for Async Operations

```typescript
await waitFor(() => {
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});
```

### 4. Clean Up After Tests

Jest automatically cleans up after each test, but for manual cleanup:

```typescript
afterEach(() => {
  jest.clearAllMocks();
});
```

### 5. Test User Behavior, Not Implementation

Focus on what the user sees and does, not internal component logic.

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-deployment checks

## Troubleshooting

### Tests Timeout

Increase timeout for slow tests:
```typescript
it('slow test', async () => {
  // test code
}, 10000); // 10 second timeout
```

### Mock Not Working

Ensure mocks are defined before imports:
```typescript
jest.mock('@/lib/supabaseClient', () => ({
  supabase: mockClient,
}));

import { MyComponent } from '../MyComponent'; // After mock
```

### Async Warnings

Use `waitFor` or `act` for async state updates:
```typescript
await waitFor(() => {
  expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

## Future Improvements

- [ ] Add integration tests with Playwright/Cypress (Task 10.2)
- [ ] Increase coverage to 90%+
- [ ] Add visual regression testing
- [ ] Add performance testing
- [ ] Add accessibility testing with axe-core

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

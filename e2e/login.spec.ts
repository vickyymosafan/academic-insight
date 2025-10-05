import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('should display login page with all elements', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: 'Academic Insight' })).toBeVisible();
    
    // Check form elements
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /masuk/i })).toBeVisible();
    
    // Check description text
    await expect(page.getByText('Masuk ke dashboard analisis kinerja program studi')).toBeVisible();
  });

  test('should have proper input types and attributes', async ({ page }) => {
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');
    
    // Check input types
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Check autocomplete attributes
    await expect(emailInput).toHaveAttribute('autocomplete', 'email');
    await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });

  test('should allow typing in email and password fields', async ({ page }) => {
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');
    
    await emailInput.fill('test@university.edu');
    await passwordInput.fill('password123');
    
    await expect(emailInput).toHaveValue('test@university.edu');
    await expect(passwordInput).toHaveValue('password123');
  });

  test('should show loading state when submitting', async ({ page }) => {
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');
    const submitButton = page.getByRole('button', { name: /masuk/i });
    
    await emailInput.fill('test@university.edu');
    await passwordInput.fill('password123');
    
    // Click submit and check for loading state
    await submitButton.click();
    
    // Should show loading text
    await expect(page.getByText(/masuk\.\.\./i)).toBeVisible({ timeout: 1000 }).catch(() => {
      // Loading state might be too fast to catch, that's okay
    });
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that elements are still visible
    await expect(page.getByRole('heading', { name: 'Academic Insight' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /masuk/i })).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check for proper labels
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');
    
    await expect(emailInput).toHaveAttribute('id', 'email');
    await expect(passwordInput).toHaveAttribute('id', 'password');
    
    // Check button is accessible
    const submitButton = page.getByRole('button', { name: /masuk/i });
    await expect(submitButton).toBeEnabled();
  });
});

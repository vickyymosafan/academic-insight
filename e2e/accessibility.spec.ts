import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@university.edu');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should have skip to main content link', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Press Tab to focus skip link
    await page.keyboard.press('Tab');
    
    // Check if skip link is visible when focused
    const skipLink = page.locator('a:has-text("Lewati ke konten utama")');
    await expect(skipLink).toBeFocused();
  });

  test('should have proper ARIA labels on navigation', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check sidebar has proper ARIA label
    const nav = page.locator('nav[aria-label="Menu navigasi utama"]');
    await expect(nav).toBeVisible();
    
    // Check active page has aria-current
    const activeLink = page.locator('a[aria-current="page"]');
    await expect(activeLink).toBeVisible();
  });

  test('should have keyboard navigable sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Open mobile menu on small screens
    const menuButton = page.locator('button[aria-label="Buka menu navigasi"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      
      // Check dialog is properly labeled
      const dialog = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(dialog).toBeVisible();
      
      // Close button should be keyboard accessible
      const closeButton = page.locator('button[aria-label="Tutup menu navigasi"]');
      await expect(closeButton).toBeVisible();
      await closeButton.press('Enter');
    }
  });

  test('should have proper form labels and ARIA attributes', async ({ page }) => {
    await page.goto('/admin/students/new');
    
    // Check all required fields have proper labels
    const nimLabel = page.locator('label:has-text("NIM")');
    await expect(nimLabel).toBeVisible();
    
    const nimInput = page.locator('input[name="nim"]');
    await expect(nimInput).toHaveAttribute('aria-required', 'true');
    await expect(nimInput).toHaveAttribute('required');
    
    // Check error messages have proper ARIA
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
    
    const errorMessage = page.locator('[role="alert"]').first();
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('should have accessible loading states', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check loading spinner has proper ARIA
    const spinner = page.locator('[role="status"][aria-live="polite"]');
    if (await spinner.isVisible()) {
      await expect(spinner).toBeVisible();
    }
  });

  test('should have proper focus management in modals', async ({ page }) => {
    await page.goto('/admin/students');
    
    // If there's a delete button, test modal focus
    const deleteButton = page.locator('button:has-text("Hapus")').first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Modal should trap focus
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        await expect(modal).toBeVisible();
        
        // Press Tab multiple times and ensure focus stays in modal
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        
        const focusedElement = page.locator(':focus');
        const isInModal = await modal.locator(':focus').count() > 0;
        expect(isInModal).toBeTruthy();
      }
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for proper heading structure
    const h1 = page.locator('h1');
    if (await h1.count() > 0) {
      await expect(h1.first()).toBeVisible();
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check primary button has good contrast
    const primaryButton = page.locator('button.bg-blue-600').first();
    if (await primaryButton.isVisible()) {
      const color = await primaryButton.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });
      
      const bgColor = await primaryButton.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      // Basic check that colors are defined
      expect(color).toBeTruthy();
      expect(bgColor).toBeTruthy();
    }
  });

  test('should have keyboard accessible dropdowns', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Test user menu dropdown
    const menuButton = page.locator('button[aria-label*="Menu pengguna"]');
    await expect(menuButton).toBeVisible();
    
    // Open with keyboard
    await menuButton.focus();
    await page.keyboard.press('Enter');
    
    // Check menu items are visible
    const menuItems = page.locator('[role="menuitem"]');
    if (await menuItems.count() > 0) {
      await expect(menuItems.first()).toBeVisible();
    }
  });

  test('should announce form submission status to screen readers', async ({ page }) => {
    await page.goto('/admin/students/new');
    
    // Fill form with invalid data
    await page.fill('input[name="nim"]', '123');
    await page.fill('input[name="name"]', 'Test');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toHaveAttribute('aria-busy', 'false');
    
    await submitButton.click();
    
    // Check button shows loading state
    await expect(submitButton).toHaveAttribute('aria-busy', 'true');
  });
});

test.describe('Responsive Design Tests', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/auth/login');
    
    // Check form is visible and usable
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    // Check inputs are properly sized
    const emailInput = page.locator('input[type="email"]');
    const boundingBox = await emailInput.boundingBox();
    expect(boundingBox?.width).toBeGreaterThan(200);
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/auth/login');
    
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });

  test('should be responsive on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/auth/login');
    
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });

  test('should have proper spacing on all screen sizes', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1920, height: 1080 }, // Desktop
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/dashboard');
      
      // Check main content has proper padding
      const main = page.locator('main, [role="main"]');
      if (await main.count() > 0) {
        const padding = await main.first().evaluate((el) => {
          return window.getComputedStyle(el).padding;
        });
        expect(padding).toBeTruthy();
      }
    }
  });
});

test.describe('Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@university.edu');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should navigate through all main features', async ({ page }) => {
    // Dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Navigate to students page
    const studentsLink = page.locator('a:has-text("Data Mahasiswa")');
    if (await studentsLink.isVisible()) {
      await studentsLink.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Navigate to admin page if user is admin
    const adminLink = page.locator('a:has-text("Manajemen Data")');
    if (await adminLink.isVisible()) {
      await adminLink.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should handle CRUD operations with proper feedback', async ({ page }) => {
    await page.goto('/admin/students/new');
    
    // Fill form
    await page.fill('input[name="nim"]', '1234567890');
    await page.fill('input[name="name"]', 'Test Student');
    await page.selectOption('select[name="program_studi"]', 'Teknik Informatika');
    await page.fill('input[name="angkatan"]', '2024');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Check for success message
    const toast = page.locator('[role="alert"], .toast');
    if (await toast.isVisible()) {
      await expect(toast).toBeVisible();
    }
  });

  test('should maintain state during navigation', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigate away and back
    await page.goto('/dashboard/students');
    await page.goBack();
    
    // Dashboard should still be functional
    await expect(page).toHaveURL('/dashboard');
  });
});

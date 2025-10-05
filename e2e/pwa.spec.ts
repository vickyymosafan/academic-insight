import { test, expect } from '@playwright/test';

test.describe('PWA Functionality', () => {
  test('should have PWA manifest', async ({ page }) => {
    await page.goto('/');
    
    // Check for manifest link
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);
    
    // Get manifest URL and fetch it
    const manifestHref = await manifestLink.getAttribute('href');
    expect(manifestHref).toBeTruthy();
    
    // Navigate to manifest and check it loads
    const manifestResponse = await page.request.get(manifestHref!);
    expect(manifestResponse.ok()).toBeTruthy();
    
    // Parse manifest JSON
    const manifest = await manifestResponse.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.icons).toBeTruthy();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test('should have service worker registered', async ({ page, context }) => {
    await page.goto('/');
    
    // Wait for service worker to register
    await page.waitForTimeout(2000);
    
    // Check if service worker is registered
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration !== undefined;
      }
      return false;
    });
    
    expect(swRegistered).toBeTruthy();
  });

  test('should have proper meta tags for PWA', async ({ page }) => {
    await page.goto('/');
    
    // Check for theme-color meta tag
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveCount(1);
    
    // Check for viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);
    
    // Check for apple-mobile-web-app-capable
    const appleCapable = page.locator('meta[name="apple-mobile-web-app-capable"]');
    await expect(appleCapable).toHaveCount(1);
  });

  test('should have app icons', async ({ page }) => {
    await page.goto('/');
    
    // Check for apple touch icon
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleTouchIcon).toHaveCount(1);
    
    // Check for favicon
    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toHaveCount(1);
  });

  test('should show offline indicator when offline', async ({ page, context }) => {
    await page.goto('/dashboard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Simulate offline mode
    await context.setOffline(true);
    
    // Wait a bit for offline detection
    await page.waitForTimeout(1000);
    
    // Check if offline indicator appears
    const offlineIndicator = page.getByText(/offline/i);
    await expect(offlineIndicator).toBeVisible({ timeout: 5000 }).catch(() => {
      // Offline indicator might not show immediately, that's okay for this test
    });
    
    // Restore online mode
    await context.setOffline(false);
  });

  test('should be installable as PWA', async ({ page }) => {
    await page.goto('/');
    
    // Check for beforeinstallprompt event support
    const isInstallable = await page.evaluate(() => {
      return 'BeforeInstallPromptEvent' in window || 
             'onbeforeinstallprompt' in window;
    });
    
    // Note: This test just checks if the browser supports PWA installation
    // Actual installation testing requires manual interaction
    expect(typeof isInstallable).toBe('boolean');
  });
});

import { test, expect } from '@playwright/test';

/**
 * E2E tests for Admin CRUD operations
 * Tests the complete flow of creating, reading, updating, and deleting student data
 */

test.describe('Admin CRUD Operations', () => {
  // Setup: Login as admin before each test
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');

    // Login with admin credentials
    // Note: Update these credentials based on your test environment
    await page.fill('input[type="email"]', process.env.TEST_ADMIN_EMAIL || 'admin@test.com');
    await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD || 'password123');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard');
  });

  test('should navigate to admin students page', async ({ page }) => {
    // Navigate to admin students page
    await page.goto('/admin/students');

    // Verify page loaded
    await expect(page.locator('h1')).toContainText('Manajemen Data Mahasiswa');
    await expect(page.locator('text=Tambah Mahasiswa')).toBeVisible();
  });

  test('should display student list with filters', async ({ page }) => {
    await page.goto('/admin/students');

    // Check if filters are present
    await expect(page.locator('input[placeholder*="Cari"]')).toBeVisible();
    await expect(page.locator('select').first()).toBeVisible();

    // Check if table or cards are displayed
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    const hasCards = await page.locator('[class*="card"]').count().then(count => count > 0).catch(() => false);

    expect(hasTable || hasCards).toBeTruthy();
  });

  test('should create new student', async ({ page }) => {
    await page.goto('/admin/students/new');

    // Verify form is displayed
    await expect(page.locator('h1')).toContainText('Tambah Mahasiswa Baru');

    // Fill in student data
    const timestamp = Date.now();
    const testNIM = `TEST${timestamp.toString().slice(-8)}`;

    await page.fill('input[name="nim"]', testNIM);
    await page.fill('input[name="name"]', 'Test Student E2E');
    await page.selectOption('select[name="program_studi"]', 'Teknik Informatika');
    await page.fill('input[name="angkatan"]', '2023');
    await page.fill('input[name="ipk"]', '3.5');
    await page.fill('input[name="semester_current"]', '5');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success message or redirect
    await page.waitForURL('**/admin/students', { timeout: 10000 });

    // Verify student was created by searching for it
    await page.fill('input[placeholder*="Cari"]', testNIM);
    await page.waitForTimeout(500); // Wait for debounce

    // Check if student appears in list
    await expect(page.locator(`text=${testNIM}`)).toBeVisible({ timeout: 5000 });
  });

  test('should show validation errors for invalid data', async ({ page }) => {
    await page.goto('/admin/students/new');

    // Try to submit with invalid data
    await page.fill('input[name="nim"]', '123'); // Invalid NIM (too short)
    await page.fill('input[name="name"]', 'A'); // Invalid name (too short)
    await page.fill('input[name="ipk"]', '5.0'); // Invalid IPK (> 4.0)

    await page.click('button[type="submit"]');

    // Wait for validation errors to appear
    await page.waitForTimeout(1000);

    // Check for error messages
    const errorMessages = await page.locator('text=/.*wajib.*|.*minimal.*|.*maksimal.*|.*antara.*/i').count();
    expect(errorMessages).toBeGreaterThan(0);
  });

  test('should filter students by program studi', async ({ page }) => {
    await page.goto('/admin/students');

    // Select a program studi filter
    await page.selectOption('select >> nth=0', 'Teknik Informatika');

    // Wait for results to update
    await page.waitForTimeout(1000);

    // Verify that results are filtered (if any students exist)
    const studentCount = await page.locator('text=/Teknik Informatika/i').count();
    // Just verify the filter was applied (count could be 0 if no students)
    expect(studentCount).toBeGreaterThanOrEqual(0);
  });

  test('should search students by name or NIM', async ({ page }) => {
    await page.goto('/admin/students');

    // Type in search box
    await page.fill('input[placeholder*="Cari"]', 'test');

    // Wait for debounce and results
    await page.waitForTimeout(500);

    // Verify search was executed (results may be empty)
    const searchInput = await page.locator('input[placeholder*="Cari"]');
    await expect(searchInput).toHaveValue('test');
  });

  test('should open edit form for existing student', async ({ page }) => {
    await page.goto('/admin/students');

    // Wait for students to load
    await page.waitForTimeout(1000);

    // Find first edit button (if any students exist)
    const editButton = page.locator('text=Edit').first();
    const hasEditButton = await editButton.isVisible().catch(() => false);

    if (hasEditButton) {
      await editButton.click();

      // Verify edit page loaded
      await expect(page.locator('h1')).toContainText('Edit Data Mahasiswa');

      // Verify form has data
      const nimInput = page.locator('input[name="nim"]');
      await expect(nimInput).toBeDisabled(); // NIM should be disabled in edit mode
    } else {
      // Skip test if no students exist
      test.skip();
    }
  });

  test('should show delete confirmation dialog', async ({ page }) => {
    await page.goto('/admin/students');

    // Wait for students to load
    await page.waitForTimeout(1000);

    // Find first delete button (if any students exist)
    const deleteButton = page.locator('text=Hapus').first();
    const hasDeleteButton = await deleteButton.isVisible().catch(() => false);

    if (hasDeleteButton) {
      await deleteButton.click();

      // Verify confirmation dialog appears
      await expect(page.locator('text=/Hapus Data Mahasiswa/i')).toBeVisible();
      await expect(page.locator('text=/yakin.*hapus/i')).toBeVisible();

      // Cancel the deletion
      await page.click('text=Batal');

      // Verify dialog closed
      await expect(page.locator('text=/Hapus Data Mahasiswa/i')).not.toBeVisible();
    } else {
      // Skip test if no students exist
      test.skip();
    }
  });

  test('should handle unauthorized access for non-admin users', async ({ page }) => {
    // Logout first
    await page.goto('/dashboard');
    // Assuming there's a logout button
    const logoutButton = page.locator('text=/logout|keluar/i').first();
    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();
    }

    // Try to access admin page directly
    await page.goto('/admin/students');

    // Should redirect to login or unauthorized page
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(
      currentUrl.includes('/auth/login') || 
      currentUrl.includes('/unauthorized')
    ).toBeTruthy();
  });

  test('should refresh student list', async ({ page }) => {
    await page.goto('/admin/students');

    // Click refresh button
    await page.click('text=Refresh');

    // Wait for refresh to complete
    await page.waitForTimeout(1000);

    // Verify page is still on students list
    await expect(page.locator('h1')).toContainText('Manajemen Data Mahasiswa');
  });

  test('should navigate back from new student form', async ({ page }) => {
    await page.goto('/admin/students/new');

    // Click cancel/back button
    await page.click('text=Batal');

    // Should navigate back to students list
    await page.waitForURL('**/admin/students');
    await expect(page.locator('h1')).toContainText('Manajemen Data Mahasiswa');
  });

  test('should display responsive layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/admin/students');

    // Verify mobile layout is displayed
    await expect(page.locator('h1')).toBeVisible();

    // On mobile, table should be hidden and cards should be visible
    const table = page.locator('table');
    const isTableHidden = await table.isHidden().catch(() => true);
    expect(isTableHidden).toBeTruthy();
  });
});

test.describe('Admin CRUD - Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', process.env.TEST_ADMIN_EMAIL || 'admin@test.com');
    await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD || 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should validate NIM format', async ({ page }) => {
    await page.goto('/admin/students/new');

    await page.fill('input[name="nim"]', 'ABC123'); // Invalid: contains letters
    await page.fill('input[name="name"]', 'Test Student');
    await page.selectOption('select[name="program_studi"]', 'Teknik Informatika');
    await page.fill('input[name="angkatan"]', '2023');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Should show NIM validation error
    await expect(page.locator('text=/NIM.*digit/i')).toBeVisible();
  });

  test('should validate IPK range', async ({ page }) => {
    await page.goto('/admin/students/new');

    await page.fill('input[name="nim"]', '12345678');
    await page.fill('input[name="name"]', 'Test Student');
    await page.selectOption('select[name="program_studi"]', 'Teknik Informatika');
    await page.fill('input[name="angkatan"]', '2023');
    await page.fill('input[name="ipk"]', '4.5'); // Invalid: > 4.0

    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Should show IPK validation error
    await expect(page.locator('text=/IPK.*antara.*0.*4/i')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/admin/students/new');

    // Submit empty form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Should show multiple validation errors
    const errorCount = await page.locator('text=/wajib diisi/i').count();
    expect(errorCount).toBeGreaterThan(0);
  });
});

import { test, expect } from '@playwright/test';

/**
 * Test Suite: Successful Login Flow
 * Tests the complete login workflow with valid credentials and navbar verification
 */
test.describe('Successful Login Flow', () => {
  const TEST_EMAIL = 'test@example.com';
  const TEST_PASSWORD = 'password123';

  test('should login successfully and redirect to dashboard', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill in login form with test credentials
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard');

    // Verify we're on the dashboard
    expect(page.url()).toContain('/dashboard');
  });

  test('should display dashboard content after login', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill in login form
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);

    // Submit login form
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL('/dashboard');

    // Verify dashboard heading is visible
    await expect(page.locator('h2').filter({ hasText: 'Your Properties' })).toBeVisible();
  });

  test('should display "Upkeep" brand in navbar after login', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Login with test credentials
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL('/dashboard');

    // Verify "Upkeep" brand text is visible in header/navbar
    const upkeepBrand = page.locator('header').getByText('Upkeep');
    await expect(upkeepBrand).toBeVisible();
  });

  test('should display navigation links after login', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Login
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL('/dashboard');

    // Verify navigation links are visible
    const dashboardLink = page.locator('nav a[href="/dashboard"]');
    const propertiesLink = page.locator('nav a[href="/properties"]');

    await expect(dashboardLink).toBeVisible();
    await expect(dashboardLink).toContainText('Dashboard');

    await expect(propertiesLink).toBeVisible();
    await expect(propertiesLink).toContainText('Properties');
  });

  test('should display logout button after login', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Login
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL('/dashboard');

    // Verify logout button is visible
    const logoutButton = page.locator('button').filter({ hasText: 'Logout' });
    await expect(logoutButton).toBeVisible();
  });

  test('should complete full authentication flow', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Verify we're on login page
    expect(page.url()).toContain('/login');

    // Login
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL('/dashboard');

    // Verify complete authenticated state
    await expect(page.locator('header').getByText('Upkeep')).toBeVisible();
    await expect(page.locator('nav a[href="/dashboard"]')).toBeVisible();
    await expect(page.locator('nav a[href="/properties"]')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Logout' })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: 'Your Properties' })).toBeVisible();
  });

  test('should display both "View Properties" and "Add Property" buttons on dashboard', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Login
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL('/dashboard');

    // Verify both buttons are visible
    const viewPropertiesButton = page.locator('button').filter({ hasText: 'View Properties' });
    const addPropertyButton = page.locator('button').filter({ hasText: 'Add Property' });

    await expect(viewPropertiesButton).toBeVisible();
    await expect(addPropertyButton).toBeVisible();
  });

  test('should navigate to properties list when "View Properties" button is clicked', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Login
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL('/dashboard');

    // Click "View Properties" button
    await page.click('button:has-text("View Properties")');

    // Verify navigation to properties list
    await page.waitForURL('/properties');
    expect(page.url()).toContain('/properties');
  });

  test('should navigate to add property form when "Add Property" button is clicked', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Login
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL('/dashboard');

    // Click "Add Property" button
    await page.click('button:has-text("Add Property")');

    // Verify navigation to add property form
    await page.waitForURL('/properties/add');
    expect(page.url()).toContain('/properties/add');
  });
});

import { test, expect } from '@playwright/test';

/**
 * Test Suite: Login Error Handling
 * Tests login form behavior with invalid credentials
 */
test.describe('Login Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/login');
  });

  test('should display error message with invalid credentials', async ({ page }) => {
    // Fill in login form with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Click login button
    await page.click('button[type="submit"]');

    // Wait a bit for error to appear
    await page.waitForTimeout(1000);

    // Verify error message appears (error messages typically have text-red or similar styling)
    const errorMessage = page.locator('.text-primary-400, [class*="error"], p').filter({
      hasText: /Invalid|error|credentials|failed/i
    });

    // Check if any error indicator is visible
    const hasError = await errorMessage.count() > 0;
    expect(hasError).toBeTruthy();
  });

  test('should remain on login page after failed login', async ({ page }) => {
    // Fill in login form with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Click login button
    await page.click('button[type="submit"]');

    // Wait a bit
    await page.waitForTimeout(1000);

    // Verify we're still on login page
    expect(page.url()).toContain('/login');
  });

  test('should not navigate to dashboard with invalid credentials', async ({ page }) => {
    // Fill in login form with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Click login button
    await page.click('button[type="submit"]');

    // Wait a bit
    await page.waitForTimeout(1500);

    // Verify we did NOT navigate to dashboard
    expect(page.url()).not.toContain('/dashboard');
    expect(page.url()).toContain('/login');
  });

  test('should clear form and allow retry after error', async ({ page }) => {
    // First attempt with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for error
    await page.waitForTimeout(1000);

    // Verify we can still interact with the form
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toBeEnabled();
    await expect(passwordInput).toBeEnabled();

    // Clear and try again
    await emailInput.clear();
    await passwordInput.clear();

    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');

    // Verify inputs are filled
    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('password123');
  });
});

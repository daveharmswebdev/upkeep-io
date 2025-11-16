import { test, expect } from '@playwright/test';

/**
 * Test Suite: Login Page Rendering
 * Verifies that the login page loads correctly with all required elements
 */
test.describe('Login Page Rendering', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/login');
  });

  test('should display Login heading', async ({ page }) => {
    // Verify the page has "Login" heading
    await expect(page.locator('h1').filter({ hasText: 'Login' })).toBeVisible();
  });

  test('should display email input field', async ({ page }) => {
    // Verify email input is present and has correct type
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('id', 'email');
  });

  test('should display password input field', async ({ page }) => {
    // Verify password input is present and has correct type
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('id', 'password');
  });

  test('should display Login submit button', async ({ page }) => {
    // Verify submit button is present with correct text
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toHaveText('Login');
  });

  test('should display link to signup page', async ({ page }) => {
    // Verify signup link is present
    const signupLink = page.locator('a[href="/signup"]');
    await expect(signupLink).toBeVisible();
    await expect(signupLink).toContainText('Sign up');
  });

  test('should have all required form elements', async ({ page }) => {
    // Comprehensive test verifying all elements are present
    await expect(page.locator('h1').filter({ hasText: 'Login' })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('a[href="/signup"]')).toBeVisible();
  });
});

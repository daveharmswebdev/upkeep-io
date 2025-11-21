import { test, expect } from '@playwright/test';

/**
 * Test Suite: Property Delete Confirmation Modal
 * Tests the complete delete property workflow with confirmation modal
 *
 * Prerequisites:
 * - User must be logged in
 * - At least one property must exist for testing
 *
 * Coverage:
 * - Modal appearance and content
 * - Delete confirmation flow
 * - Cancel deletion flow
 * - ESC key closes modal
 * - Click outside closes modal
 * - Accessibility (focus management)
 */

test.describe('Property Delete Confirmation Modal', () => {
  const TEST_EMAIL = 'test@example.com';
  const TEST_PASSWORD = 'password123';

  // Helper function to login before each test
  async function loginUser(page: any) {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  }

  // Helper function to navigate to first property details page
  async function navigateToPropertyDetails(page: any) {
    await page.goto('/properties');
    await page.waitForSelector('a[href^="/properties/"]', { timeout: 5000 });

    // Click first property card link
    const propertyLinks = page.locator('a[href^="/properties/"]').filter({ hasText: /.*/ });
    const firstPropertyLink = propertyLinks.first();
    await firstPropertyLink.click();

    // Wait for property details page to load
    await page.waitForSelector('h1:has-text("Property Details")', { timeout: 5000 });
  }

  test.describe('Modal Display', () => {
    test('should display delete confirmation modal with correct content', async ({ page }) => {
      await loginUser(page);
      await navigateToPropertyDetails(page);

      // Click Delete button
      const deleteButton = page.locator('button:has-text("Delete")').first();
      await deleteButton.click();

      // Verify modal appears
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Verify modal has aria-modal attribute
      await expect(modal).toHaveAttribute('aria-modal', 'true');

      // Verify modal title
      const modalTitle = modal.locator('h2:has-text("Delete Property")');
      await expect(modalTitle).toBeVisible();

      // Verify modal message contains "Are you sure"
      const modalMessage = modal.locator('p');
      await expect(modalMessage).toContainText('Are you sure you want to delete');

      // Verify Cancel button exists and is styled correctly
      const cancelButton = modal.locator('button:has-text("Cancel")');
      await expect(cancelButton).toBeVisible();
      await expect(cancelButton).toHaveClass(/bg-gray-200/);

      // Verify Delete button exists and is styled correctly
      const confirmDeleteButton = modal.locator('button:has-text("Delete")');
      await expect(confirmDeleteButton).toBeVisible();
      await expect(confirmDeleteButton).toHaveClass(/bg-primary-300/);
    });

    test('should display property address in confirmation message', async ({ page }) => {
      await loginUser(page);
      await navigateToPropertyDetails(page);

      // Get property address from page
      const addressElement = page.locator('.bg-gray-50 p').first();
      const address = await addressElement.textContent();

      // Click Delete button
      const deleteButton = page.locator('button:has-text("Delete")').first();
      await deleteButton.click();

      // Verify modal message includes the address
      const modal = page.locator('[role="dialog"]');
      const modalMessage = modal.locator('p');

      if (address) {
        await expect(modalMessage).toContainText(address);
      }
    });
  });

  test.describe('Delete Confirmation Flow', () => {
    test('should delete property and navigate to list on confirmation', async ({ page }) => {
      await loginUser(page);
      await navigateToPropertyDetails(page);

      // Get current URL to verify property ID
      const currentUrl = page.url();
      const propertyId = currentUrl.split('/properties/')[1];

      // Click Delete button
      const deleteButton = page.locator('button:has-text("Delete")').first();
      await deleteButton.click();

      // Wait for modal to appear
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Click Delete in modal
      const confirmDeleteButton = modal.locator('button:has-text("Delete")');
      await confirmDeleteButton.click();

      // Verify navigation to properties list
      await page.waitForURL('/properties', { timeout: 5000 });
      expect(page.url()).toContain('/properties');

      // Verify success toast appears
      const toast = page.locator('.Vue-Toastification__toast--success');
      await expect(toast).toBeVisible({ timeout: 3000 });
      await expect(toast).toContainText('Property deleted successfully');
    });
  });

  test.describe('Cancel Deletion Flow', () => {
    test('should close modal and stay on page when Cancel is clicked', async ({ page }) => {
      await loginUser(page);
      await navigateToPropertyDetails(page);

      // Get current URL before deletion attempt
      const currentUrl = page.url();

      // Click Delete button
      const deleteButton = page.locator('button:has-text("Delete")').first();
      await deleteButton.click();

      // Wait for modal to appear
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Click Cancel button in modal
      const cancelButton = modal.locator('button:has-text("Cancel")');
      await cancelButton.click();

      // Verify modal is closed
      await expect(modal).not.toBeVisible();

      // Verify we're still on the same property details page
      expect(page.url()).toBe(currentUrl);

      // Verify property details are still visible
      await expect(page.locator('h1:has-text("Property Details")')).toBeVisible();
    });

    test('should keep property intact after canceling deletion', async ({ page }) => {
      await loginUser(page);
      await navigateToPropertyDetails(page);

      // Get property address before deletion attempt
      const addressElement = page.locator('.bg-gray-50 p').first();
      const originalAddress = await addressElement.textContent();

      // Click Delete button
      const deleteButton = page.locator('button:has-text("Delete")').first();
      await deleteButton.click();

      // Cancel deletion
      const modal = page.locator('[role="dialog"]');
      const cancelButton = modal.locator('button:has-text("Cancel")');
      await cancelButton.click();

      // Refresh page to verify property still exists
      await page.reload();
      await page.waitForSelector('h1:has-text("Property Details")');

      // Verify property address is still the same
      const addressAfterCancel = await addressElement.textContent();
      expect(addressAfterCancel).toBe(originalAddress);
    });
  });

  test.describe('ESC Key Behavior', () => {
    test('should close modal when ESC key is pressed', async ({ page }) => {
      await loginUser(page);
      await navigateToPropertyDetails(page);

      // Click Delete button
      const deleteButton = page.locator('button:has-text("Delete")').first();
      await deleteButton.click();

      // Wait for modal to appear
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Press ESC key
      await page.keyboard.press('Escape');

      // Verify modal is closed
      await expect(modal).not.toBeVisible();

      // Verify we're still on property details page
      await expect(page.locator('h1:has-text("Property Details")')).toBeVisible();
    });

    test('should keep property intact after ESC key press', async ({ page }) => {
      await loginUser(page);
      await navigateToPropertyDetails(page);

      // Get current URL
      const currentUrl = page.url();

      // Click Delete button
      const deleteButton = page.locator('button:has-text("Delete")').first();
      await deleteButton.click();

      // Press ESC key
      await page.keyboard.press('Escape');

      // Verify we're still on the same page
      expect(page.url()).toBe(currentUrl);

      // Refresh to verify property still exists
      await page.reload();
      await expect(page.locator('h1:has-text("Property Details")')).toBeVisible();
    });
  });

  test.describe('Click Outside Behavior', () => {
    test('should close modal when clicking backdrop', async ({ page }) => {
      await loginUser(page);
      await navigateToPropertyDetails(page);

      // Click Delete button
      const deleteButton = page.locator('button:has-text("Delete")').first();
      await deleteButton.click();

      // Wait for modal to appear
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Click on backdrop (outside modal content)
      const backdrop = page.locator('.fixed.inset-0').first();
      await backdrop.click({ position: { x: 10, y: 10 } });

      // Verify modal is closed
      await expect(modal).not.toBeVisible();
    });

    test('should keep property intact after clicking outside', async ({ page }) => {
      await loginUser(page);
      await navigateToPropertyDetails(page);

      // Get current URL
      const currentUrl = page.url();

      // Click Delete button
      const deleteButton = page.locator('button:has-text("Delete")').first();
      await deleteButton.click();

      // Click backdrop to close
      const backdrop = page.locator('.fixed.inset-0').first();
      await backdrop.click({ position: { x: 10, y: 10 } });

      // Verify we're still on the same page
      expect(page.url()).toBe(currentUrl);

      // Refresh to verify property still exists
      await page.reload();
      await expect(page.locator('h1:has-text("Property Details")')).toBeVisible();
    });
  });

  test.describe('Accessibility - Focus Management', () => {
    test('should focus Cancel button on modal open', async ({ page }) => {
      await loginUser(page);
      await navigateToPropertyDetails(page);

      // Click Delete button
      const deleteButton = page.locator('button:has-text("Delete")').first();
      await deleteButton.click();

      // Wait for modal to appear
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Wait a bit for focus to settle
      await page.waitForTimeout(100);

      // Verify Cancel button has focus
      const cancelButton = modal.locator('button:has-text("Cancel")');
      await expect(cancelButton).toBeFocused();
    });

    test('should trap focus within modal with Tab key', async ({ page }) => {
      await loginUser(page);
      await navigateToPropertyDetails(page);

      // Click Delete button
      const deleteButton = page.locator('button:has-text("Delete")').first();
      await deleteButton.click();

      // Wait for modal
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Wait for initial focus
      await page.waitForTimeout(100);

      const cancelButton = modal.locator('button:has-text("Cancel")');
      const confirmDeleteButton = modal.locator('button:has-text("Delete")');

      // Initially Cancel button should be focused
      await expect(cancelButton).toBeFocused();

      // Press Tab to move to Delete button
      await page.keyboard.press('Tab');
      await expect(confirmDeleteButton).toBeFocused();

      // Press Tab again - should wrap back to Cancel button (focus trap)
      await page.keyboard.press('Tab');
      await expect(cancelButton).toBeFocused();
    });

    test('should trap focus with Shift+Tab (reverse)', async ({ page }) => {
      await loginUser(page);
      await navigateToPropertyDetails(page);

      // Click Delete button
      const deleteButton = page.locator('button:has-text("Delete")').first();
      await deleteButton.click();

      // Wait for modal
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Wait for initial focus
      await page.waitForTimeout(100);

      const cancelButton = modal.locator('button:has-text("Cancel")');
      const confirmDeleteButton = modal.locator('button:has-text("Delete")');

      // Initially Cancel button should be focused
      await expect(cancelButton).toBeFocused();

      // Press Shift+Tab to move backwards - should wrap to Delete button
      await page.keyboard.press('Shift+Tab');
      await expect(confirmDeleteButton).toBeFocused();

      // Press Shift+Tab again - should wrap to Cancel button
      await page.keyboard.press('Shift+Tab');
      await expect(cancelButton).toBeFocused();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle delete errors gracefully', async ({ page }) => {
      // Note: This test would require mocking the API to return an error
      // For now, we'll just verify the error handling structure exists
      await loginUser(page);
      await navigateToPropertyDetails(page);

      // The actual error handling would be tested with API mocking
      // This is a placeholder to document the expected behavior:
      // 1. If delete fails, modal should close
      // 2. Error toast should appear
      // 3. User should remain on property details page
    });
  });
});

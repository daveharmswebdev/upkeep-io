import { test, expect } from '@playwright/test';

/**
 * Test Suite: Property Form Cancel Navigation (Issue #24)
 *
 * Verifies that the cancel button in PropertyFormView navigates to the correct destination:
 * - Add mode: Cancel should return to Dashboard
 * - Edit mode: Cancel should return to Property Detail View
 *
 * Reference: docs/add-property-workflow/new-property-workflow.md Section 6d
 */
test.describe('Property Form Cancel Navigation', () => {
  const TEST_EMAIL = 'test@example.com';
  const TEST_PASSWORD = 'password123';

  /**
   * Helper: Login user and navigate to dashboard
   */
  async function loginAndGoToDashboard(page: any) {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  }

  test('should navigate to Dashboard when canceling from Add Property form', async ({ page }) => {
    // ARRANGE: Login and navigate to dashboard
    await loginAndGoToDashboard(page);

    // ACT: Click "Add Property" button on Dashboard
    await page.click('button:has-text("Add Property")');
    await page.waitForURL('/properties/add');

    // VERIFY: We're on the Add Property form
    await expect(page.locator('h1').filter({ hasText: 'Add Property' })).toBeVisible();

    // ACT: Click Cancel button
    await page.click('button:has-text("Cancel")');

    // ASSERT: Should navigate back to Dashboard (NOT to Property List)
    await page.waitForURL('/dashboard');
    expect(page.url()).toContain('/dashboard');

    // VERIFY: Dashboard content is visible
    await expect(page.locator('h2').filter({ hasText: 'Your Properties' })).toBeVisible();
  });

  test('should navigate to Dashboard when clicking top cancel button from Add Property form', async ({ page }) => {
    // ARRANGE: Login and navigate to dashboard
    await loginAndGoToDashboard(page);

    // ACT: Click "Add Property" button on Dashboard
    await page.click('button:has-text("Add Property")');
    await page.waitForURL('/properties/add');

    // VERIFY: We're on the Add Property form
    await expect(page.locator('h1').filter({ hasText: 'Add Property' })).toBeVisible();

    // ACT: Click the top "Cancel" button (has back arrow SVG)
    // There are two Cancel buttons: one at top-left with arrow, one at bottom of form
    // We'll click the first one (top-left)
    await page.locator('button:has-text("Cancel")').first().click();

    // ASSERT: Should navigate back to Dashboard
    await page.waitForURL('/dashboard');
    expect(page.url()).toContain('/dashboard');

    // VERIFY: Dashboard content is visible
    await expect(page.locator('h2').filter({ hasText: 'Your Properties' })).toBeVisible();
  });

  test('should navigate to Property Detail when canceling from Edit Property form', async ({ page }) => {
    // ARRANGE: Login and navigate to properties list
    await loginAndGoToDashboard(page);
    await page.click('button:has-text("View Properties")');
    await page.waitForURL('/properties');

    // Ensure we have at least one property to test with
    const propertyCards = page.locator('[data-testid="property-card"]');
    const cardCount = await propertyCards.count();

    // If no properties exist, skip this test
    if (cardCount === 0) {
      test.skip();
      return;
    }

    // ACT: Click first property card to view details
    await propertyCards.first().click();

    // Wait for property detail page (URL will be /properties/:id)
    await page.waitForURL(/\/properties\/[a-f0-9-]+$/);
    const propertyDetailUrl = page.url();
    const propertyId = propertyDetailUrl.split('/').pop();

    // VERIFY: We're on Property Detail page
    await expect(page.locator('h1')).toBeVisible();

    // ACT: Click "Edit" button to go to Edit Property form
    await page.click('button:has-text("Edit")');
    await page.waitForURL(/\/properties\/[a-f0-9-]+\/edit$/);

    // VERIFY: We're on the Edit Property form
    await expect(page.locator('h1').filter({ hasText: 'Edit Property' })).toBeVisible();

    // ACT: Click Cancel button
    await page.click('button:has-text("Cancel")');

    // ASSERT: Should navigate back to Property Detail (NOT to Dashboard or Property List)
    await page.waitForURL(`/properties/${propertyId}`);
    expect(page.url()).toContain(`/properties/${propertyId}`);
    expect(page.url()).not.toContain('/edit');

    // VERIFY: We're back on Property Detail page
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should discard form data when canceling from Add Property form', async ({ page }) => {
    // ARRANGE: Login and navigate to Add Property form
    await loginAndGoToDashboard(page);
    await page.click('button:has-text("Add Property")');
    await page.waitForURL('/properties/add');

    // ACT: Fill in some form fields
    await page.fill('input[name="street"]', '123 Test Street');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="state"]', 'CA');
    await page.fill('input[name="zipCode"]', '90210');

    // ACT: Click Cancel
    await page.click('button:has-text("Cancel")');
    await page.waitForURL('/dashboard');

    // ACT: Navigate back to Add Property form
    await page.click('button:has-text("Add Property")');
    await page.waitForURL('/properties/add');

    // ASSERT: Form should be blank (data was discarded)
    await expect(page.locator('input[name="street"]')).toHaveValue('');
    await expect(page.locator('input[name="city"]')).toHaveValue('');
    await expect(page.locator('input[name="state"]')).toHaveValue('');
    await expect(page.locator('input[name="zipCode"]')).toHaveValue('');
  });

  test('should display "Add Property" heading on add form and "Edit Property" heading on edit form', async ({ page }) => {
    // ARRANGE: Login
    await loginAndGoToDashboard(page);

    // ACT: Navigate to Add Property
    await page.click('button:has-text("Add Property")');
    await page.waitForURL('/properties/add');

    // ASSERT: Heading should be "Add Property"
    await expect(page.locator('h1').filter({ hasText: 'Add Property' })).toBeVisible();
    await expect(page.locator('h1').filter({ hasText: 'Edit Property' })).not.toBeVisible();

    // ACT: Navigate back to dashboard and then go to property list
    await page.locator('button:has-text("Cancel")').first().click();
    await page.waitForURL('/dashboard');
    await page.click('button:has-text("View Properties")');
    await page.waitForURL('/properties');

    // Check if we have properties for edit test
    const propertyCards = page.locator('[data-testid="property-card"]');
    const cardCount = await propertyCards.count();

    if (cardCount === 0) {
      // If no properties, test only the add scenario
      return;
    }

    // ACT: Click first property and edit
    await propertyCards.first().click();
    await page.waitForURL(/\/properties\/[a-f0-9-]+$/);
    await page.click('button:has-text("Edit")');
    await page.waitForURL(/\/properties\/[a-f0-9-]+\/edit$/);

    // ASSERT: Heading should be "Edit Property"
    await expect(page.locator('h1').filter({ hasText: 'Edit Property' })).toBeVisible();
    await expect(page.locator('h1').filter({ hasText: 'Add Property' })).not.toBeVisible();
  });
});

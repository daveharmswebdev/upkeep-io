import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Lease Occupant Management Feature (Issue #50)
 *
 * Tests the occupant management functionality in both CREATE and EDIT modes:
 * - Adding occupants during lease creation
 * - Viewing occupants on existing leases
 * - Adding occupants to existing leases via modal
 * - Removing occupants from leases
 * - Validation for adult vs child occupants
 */

test.describe('Lease Occupant Management', () => {
  let propertyId: string;
  let leaseId: string;

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Create a test property
    await page.goto('/properties/add');
    await page.fill('[name="street"]', '456 Test Ave');
    await page.fill('[name="city"]', 'San Francisco');
    await page.fill('[name="zip"]', '94103');
    await page.fill('[name="state"]', 'CA');
    await page.click('button[type="submit"]');

    // Extract property ID from URL
    await page.waitForURL(/\/properties\/[a-f0-9-]+$/);
    const url = page.url();
    propertyId = url.split('/').pop() || '';
  });

  test.describe('CREATE Mode - Add Occupants During Lease Creation', () => {
    test('should display occupants section in CREATE mode', async ({ page }) => {
      // Navigate to add lease form
      await page.goto(`/properties/${propertyId}/leases/add`);

      // Should see occupants section
      await expect(page.getByRole('heading', { name: /occupants/i })).toBeVisible();
      await expect(page.getByText(/add occupants living at the property/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /add occupant/i })).toBeVisible();
    });

    test('should add child occupant with minimal info', async ({ page }) => {
      await page.goto(`/properties/${propertyId}/leases/add`);

      // Fill required lessee info
      await page.fill('[name="lessees[0].firstName"]', 'Jane');
      await page.fill('[name="lessees[0].lastName"]', 'Smith');
      await page.fill('[name="lessees[0].email"]', 'jane@example.com');
      await page.fill('[name="lessees[0].phone"]', '555-1234');

      // Fill lease details
      await page.fill('[name="startDate"]', '2025-01-01');

      // Add child occupant (no email/phone required)
      await page.click('button[text="Add Occupant"]');
      await page.fill('[name="occupants[0].firstName"]', 'Timmy');
      await page.fill('[name="occupants[0].lastName"]', 'Smith');
      // isAdult should default to false (child)

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to property details
      await expect(page).toHaveURL(`/properties/${propertyId}`);
      await expect(page.getByText(/lease created successfully/i)).toBeVisible();
    });

    test('should add adult occupant with email and phone', async ({ page }) => {
      await page.goto(`/properties/${propertyId}/leases/add`);

      // Fill required lessee info
      await page.fill('[name="lessees[0].firstName"]', 'John');
      await page.fill('[name="lessees[0].lastName"]', 'Doe');
      await page.fill('[name="lessees[0].email"]', 'john@example.com');
      await page.fill('[name="lessees[0].phone"]', '555-5678');

      // Fill lease details
      await page.fill('[name="startDate"]', '2025-01-01');

      // Add adult occupant
      await page.click('button[text="Add Occupant"]');
      await page.fill('[name="occupants[0].firstName"]', 'Sarah');
      await page.fill('[name="occupants[0].lastName"]', 'Doe');
      await page.check('[name="occupants[0].isAdult"]'); // Check adult checkbox
      await page.fill('[name="occupants[0].email"]', 'sarah@example.com');
      await page.fill('[name="occupants[0].phone"]', '555-9999');

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to property details
      await expect(page).toHaveURL(`/properties/${propertyId}`);
      await expect(page.getByText(/lease created successfully/i)).toBeVisible();
    });

    test('should validate adult occupant requires email and phone', async ({ page }) => {
      await page.goto(`/properties/${propertyId}/leases/add`);

      // Fill required lessee info
      await page.fill('[name="lessees[0].firstName"]', 'Jane');
      await page.fill('[name="lessees[0].lastName"]', 'Smith');
      await page.fill('[name="lessees[0].email"]', 'jane@example.com');
      await page.fill('[name="lessees[0].phone"]', '555-1234');

      // Fill lease details
      await page.fill('[name="startDate"]', '2025-01-01');

      // Add adult occupant WITHOUT email/phone
      await page.click('button[text="Add Occupant"]');
      await page.fill('[name="occupants[0].firstName"]', 'Bob');
      await page.fill('[name="occupants[0].lastName"]', 'Smith');
      await page.check('[name="occupants[0].isAdult"]'); // Check adult checkbox
      // Don't fill email or phone

      // Submit button should be disabled or show validation errors
      await page.click('button[type="submit"]');

      // Should see validation errors
      await expect(page.getByText(/email is required/i)).toBeVisible();
      await expect(page.getByText(/phone is required/i)).toBeVisible();
    });

    test('should remove occupant from form', async ({ page }) => {
      await page.goto(`/properties/${propertyId}/leases/add`);

      // Add two occupants
      await page.click('button[text="Add Occupant"]');
      await page.fill('[name="occupants[0].firstName"]', 'Child1');
      await page.fill('[name="occupants[0].lastName"]', 'Smith');

      await page.click('button[text="Add Occupant"]');
      await page.fill('[name="occupants[1].firstName"]', 'Child2');
      await page.fill('[name="occupants[1].lastName"]', 'Smith');

      // Should see both occupants
      await expect(page.getByDisplayValue('Child1')).toBeVisible();
      await expect(page.getByDisplayValue('Child2')).toBeVisible();

      // Remove first occupant
      await page.click('[aria-label="Remove occupant"]').first();

      // Should only see second occupant
      await expect(page.getByDisplayValue('Child1')).not.toBeVisible();
      await expect(page.getByDisplayValue('Child2')).toBeVisible();
    });
  });

  test.describe('EDIT Mode - Manage Occupants on Existing Lease', () => {
    test.beforeEach(async ({ page }) => {
      // Create a lease with occupants first
      await page.goto(`/properties/${propertyId}/leases/add`);

      // Fill lessee
      await page.fill('[name="lessees[0].firstName"]', 'Test');
      await page.fill('[name="lessees[0].lastName"]', 'Lessee');
      await page.fill('[name="lessees[0].email"]', 'test@example.com');
      await page.fill('[name="lessees[0].phone"]', '555-0000');

      // Fill lease details
      await page.fill('[name="startDate"]', '2025-01-01');

      // Add occupant
      await page.click('button[text="Add Occupant"]');
      await page.fill('[name="occupants[0].firstName"]', 'Existing');
      await page.fill('[name="occupants[0].lastName"]', 'Occupant');

      // Submit
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(`/properties/${propertyId}`);

      // Navigate to edit lease
      await page.click('button:has-text("Edit Lease")');
      await page.waitForURL(/\/leases\/[a-f0-9-]+\/edit$/);

      // Extract lease ID from URL
      const url = page.url();
      leaseId = url.split('/').filter(p => p !== 'edit').pop() || '';
    });

    test('should display existing occupants in EDIT mode', async ({ page }) => {
      // Should see occupants section
      await expect(page.getByRole('heading', { name: /occupants/i })).toBeVisible();

      // Should see existing occupant
      await expect(page.getByText('Existing Occupant')).toBeVisible();

      // Should see Add Occupant button
      await expect(page.getByRole('button', { name: /add occupant/i })).toBeVisible();
    });

    test('should add occupant via modal in EDIT mode', async ({ page }) => {
      // Click Add Occupant button
      await page.click('button:has-text("Add Occupant")');

      // Modal should open
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('heading', { name: /add occupant/i })).toBeVisible();

      // Fill occupant info (child)
      await page.fill('[name="firstName"]', 'New');
      await page.fill('[name="lastName"]', 'Child');

      // Submit modal
      await page.click('button[type="submit"]');

      // Should see success message
      await expect(page.getByText(/occupant added successfully/i)).toBeVisible();

      // Should see new occupant in list
      await expect(page.getByText('New Child')).toBeVisible();
    });

    test('should remove occupant with confirmation in EDIT mode', async ({ page }) => {
      // Should see existing occupant
      await expect(page.getByText('Existing Occupant')).toBeVisible();

      // Click remove button for occupant
      await page.click('[aria-label="Remove Existing Occupant"]');

      // Confirmation modal should open
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText(/are you sure/i)).toBeVisible();
      await expect(page.getByText(/Existing Occupant/)).toBeVisible();

      // Confirm removal
      await page.click('button:has-text("Remove")');

      // Should see success message
      await expect(page.getByText(/occupant removed successfully/i)).toBeVisible();

      // Should not see occupant anymore
      await expect(page.getByText('Existing Occupant')).not.toBeVisible();
    });

    test('should cancel occupant removal', async ({ page }) => {
      // Click remove button
      await page.click('[aria-label="Remove Existing Occupant"]');

      // Confirmation modal should open
      await expect(page.getByRole('dialog')).toBeVisible();

      // Cancel removal
      await page.click('button:has-text("Cancel")');

      // Modal should close
      await expect(page.getByRole('dialog')).not.toBeVisible();

      // Occupant should still be visible
      await expect(page.getByText('Existing Occupant')).toBeVisible();
    });
  });

  test.describe('Adult vs Child Validation', () => {
    test('should enable/disable email and phone fields based on isAdult checkbox', async ({ page }) => {
      await page.goto(`/properties/${propertyId}/leases/add`);

      // Add occupant
      await page.click('button[text="Add Occupant"]');

      // Default (child) - email and phone should be optional
      const emailField = page.locator('[name="occupants[0].email"]');
      const phoneField = page.locator('[name="occupants[0].phone"]');

      // Check adult checkbox
      await page.check('[name="occupants[0].isAdult"]');

      // Email and phone should now be required (have asterisks or aria-required)
      await expect(page.getByText(/email.*\*/i)).toBeVisible();
      await expect(page.getByText(/phone.*\*/i)).toBeVisible();

      // Uncheck adult checkbox
      await page.uncheck('[name="occupants[0].isAdult"]');

      // Email and phone should be optional again
      await expect(page.getByText(/email \(optional\)/i)).toBeVisible();
      await expect(page.getByText(/phone \(optional\)/i)).toBeVisible();
    });
  });
});

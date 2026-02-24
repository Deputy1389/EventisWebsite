import { test, expect } from '@playwright/test';

test('has title and hero text', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Linecite/);

  // Check for the main hero text
  await expect(page.locator('h1')).toContainText('The Command Center for Medical Record Litigation');
});

test('navigation to pilot page works', async ({ page }) => {
  await page.goto('/');

  // Click the "Book Pilot" button
  await page.getByRole('link', { name: 'Book Pilot' }).click();

  // Expects the URL to contain /pilot.
  await expect(page).toHaveURL(/\/pilot/);
});

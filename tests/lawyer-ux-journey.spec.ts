import { test, expect } from '@playwright/test';

test('Lawyer Persona Journey: Premium Three-Pane Validation', async ({ page }) => {
  console.log('--- STARTING PREMIUM UI VALIDATION ---');

  // 1. Dashboard Entrance
  await page.goto('/auth/signin');
  await page.fill('input[type="email"]', 'demo@ontarus.ai');
  await page.fill('input[type="password"]', 'eventis123');
  await page.click('button:has-text("Sign In")');

  await expect(page).toHaveURL(/\/app/);
  console.log('Dashboard loaded.');

  // 2. Select Matter Audit
  const auditButton = page.locator('a:has-text("Open Audit")').first();
  await auditButton.click();
  
  // 3. Verify Three-Pane Structure
  console.log('Step 3: Verifying 3-pane structural integrity...');
  await expect(page.locator('h1')).toContainText('Audit Mode', { timeout: 45000 });
  
  // Timeline (Left) - Use more specific locator
  await expect(page.locator('span:has-text("Timeline")').first()).toBeVisible();
  
  // Strategic Brief (Middle - Default View)
  await expect(page.locator('text=Intelligence Brief')).toBeVisible();
  
  // PDF Viewer (Right)
  await expect(page.locator('iframe[title="Document viewer"]')).toBeVisible();

  // 4. Test Interaction
  console.log('Step 4: Testing event selection and context update...');
  const eventList = page.locator('button.w-full.text-left.border');
  await expect(eventList.first()).toBeVisible({ timeout: 20000 });
  
  await eventList.first().click();
  console.log('Clicked event. Checking for details in middle pane...');
  
  // Verify context pane updates to "Signals & Risks"
  await expect(page.locator('text=Signals & Risks')).toBeVisible();
  
  await page.screenshot({ path: 'ux-test-premium-final.png', fullPage: true });
  console.log('--- PREMIUM UI VALIDATION COMPLETE ---');
});

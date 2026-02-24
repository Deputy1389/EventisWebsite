import { test, expect } from '@playwright/test';

test('deployment verification: clean high-density extraction with AI strategy', async ({ page }) => {
  console.log('--- STARTING DEPLOYMENT VERIFICATION ---');

  // 1. Login
  await page.goto('https://www.linecite.com/auth/signin');
  await page.fill('input[type="email"]', 'demo@ontarus.ai');
  await page.fill('input[type="password"]', 'eventis123');
  await page.click('button:has-text("Sign In")');

  await expect(page).toHaveURL(/\/app/, { timeout: 30000 });
  console.log('Logged in successfully.');

  // 2. Start New Matter
  await page.click('text=Start New Matter');
  const caseName = `Auto Verify - ${new Date().toISOString()}`;
  await page.fill('#caseName', caseName);

  // 3. Upload v4 Packet
  // Use absolute path with escaped backslashes
  const filePath = 'C:\\Citeline\\litigation_packet_v4\\packet.pdf';
  console.log(`Uploading: ${filePath}`);
  await page.setInputFiles('input[type="file"]', filePath);

  // 4. Wait for processing (Step 1-19)
  console.log('Processing started. Waiting for Audit Mode (approx 2-3 mins)...');
  test.setTimeout(600000); 
  await expect(page).toHaveURL(/\/app\/cases\/.*\/review/, { timeout: 300000 });
  console.log('Audit Mode loaded.');

  // 5. Verify Strategic Moat (AI Insights)
  await page.click('button[role="tab"]:has-text("Strategic Moat")');
  console.log('Checking Strategic Moat...');
  
  // Wait for AI results to load in the sidebar
  await expect(page.locator('text=Contradiction')).toBeVisible({ timeout: 60000 });
  const strategicContent = await page.innerText('body');
  
  const hasAI = strategicContent.includes('Contradiction') || strategicContent.includes('Strategic Recommendations');
  console.log(`Strategic Moat present: ${hasAI}`);
  expect(hasAI).toBe(true);

  // 6. Verify Noise Removal
  console.log('Checking for noise removal...');
  const bodyText = await page.innerText('body');
  const hasNoise = bodyText.includes('Late its part cost');
  console.log(`Noise "Late its part cost" present: ${hasNoise}`);
  expect(hasNoise).toBe(false);

  // 7. Verify High Density
  await page.click('button[role="tab"]:has-text("Timeline")');
  const eventList = page.locator('button.w-full.text-left.border');
  const count = await eventList.count();
  console.log(`Extracted event count: ${count}`);
  expect(count).toBeGreaterThan(150);

  await page.screenshot({ path: 'deployment-verification-success.png', fullPage: true });
  console.log('--- DEPLOYMENT VERIFICATION COMPLETE: SUCCESS ---');
});

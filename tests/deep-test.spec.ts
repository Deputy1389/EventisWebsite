import { test, expect } from '@playwright/test';
import path from 'path';

test('deep test: login, create matter, upload pdf, and explore audit mode', async ({ page }) => {
  // 1. Login
  console.log('Navigating to signin page...');
  await page.goto('/auth/signin');
  
  console.log('Filling login credentials...');
  await page.fill('input[type="email"]', 'demo@ontarus.ai');
  await page.fill('input[type="password"]', 'eventis123');
  await page.click('button[type="submit"]');

  // Wait for dashboard to load
  console.log('Waiting for dashboard...');
  await expect(page).toHaveURL(/\/app/, { timeout: 20000 });
  
  // Verify we see the welcome message
  const welcomeHeading = page.locator('h1');
  await expect(welcomeHeading).toContainText('Welcome back', { timeout: 10000 });
  console.log('Successfully logged in.');

  // 2. Start New Matter
  console.log('Navigating to New Case page...');
  await page.click('text=Start New Matter');
  await expect(page).toHaveURL(/\/app\/new-case/);

  // 3. Set case name and Upload PDF
  const caseName = `Deep Test - ${new Date().toISOString()}`;
  console.log(`Setting case name to: ${caseName}`);
  await page.fill('#caseName', caseName);

  // Direct upload via hidden input is more stable than filechooser event
  const filePath = 'C:\\CiteLine\\PacketIntake\\batch_029_complex_prior\\packet.pdf';
  console.log(`Uploading file: ${filePath}`);
  
  // Target the hidden file input directly
  await page.setInputFiles('input[type="file"]', filePath);

  // 4. Wait for processing and redirect to Audit Mode
  console.log('File uploaded. Waiting for processing and redirect to Audit Mode (this can take several minutes)...');
  
  // Increase timeout for the processing phase
  test.setTimeout(600000); // 10 minutes total for this test

  // Wait for the URL to change to the review page
  // The UI shows "Uploading & Analyzing..." then "Upload Complete" then redirects
  await expect(page).toHaveURL(/\/app\/cases\/.*\/review/, { timeout: 300000 });
  console.log('Redirected to Audit Mode.');

  // 5. Explore Audit Mode
  await expect(page.locator('h1')).toContainText('Audit Mode', { timeout: 30000 });
  console.log('Audit Mode loaded.');

  // Take a screenshot of the initial Audit Mode state
  await page.screenshot({ path: 'audit-mode-initial.png', fullPage: true });

  // Explore "Injury Arc"
  console.log('Exploring Injury Arc...');
  await page.click('button:has-text("Injury Arc")');
  await expect(page.locator('text=Injury Arc Summary')).toBeVisible();

  // Explore "Chronology"
  console.log('Exploring Chronology...');
  await page.click('button:has-text("Chronology")');
  
  // Wait for events to load in the list
  const eventList = page.locator('button.w-full.text-left.border');
  await expect(eventList.first()).toBeVisible({ timeout: 60000 });
  const eventCount = await eventList.count();
  console.log(`Found ${eventCount} events in chronology.`);

  // Click the first event
  if (eventCount > 0) {
      await eventList.first().click();
      console.log('Clicked first event to view details.');
      
      // Check if viewer loads something (iframe)
      const viewerIframe = page.locator('iframe[title="Source document viewer"]');
      // It might take a moment to load
      console.log('Waiting for viewer to initialize...');
  }

  // Check Context Dock
  console.log('Checking Context Dock...');
  const contextDockHeader = page.locator('text=Context Dock');
  await expect(contextDockHeader).toBeVisible();

  // Expand dock if collapsed
  const dockContainer = page.locator('div.border.rounded-lg.bg-card.overflow-hidden').last();
  const isCollapsed = await dockContainer.evaluate(el => el.clientHeight < 100);
  if (isCollapsed) {
      console.log('Expanding Context Dock...');
      await page.locator('button:has(svg.lucide-chevrons-up), button:has(svg.lucide-chevrons-down)').click();
  }

  // Click through dock tabs to see UX
  const tabs = ['Causation', 'Contradictions', 'Defense', 'Collapse'];
  for (const tab of tabs) {
      const tabTrigger = page.locator(`button[role="tab"]:has-text("${tab}")`);
      if (await tabTrigger.isVisible()) {
          await tabTrigger.click();
          console.log(`Viewed ${tab} tab in Context Dock.`);
          await page.waitForTimeout(1000); // Small pause to see the UX
      }
  }

  // Take a final screenshot of the Audit Mode with expanded dock
  await page.screenshot({ path: 'audit-mode-final.png', fullPage: true });
  console.log('Deep test exploration complete.');
});

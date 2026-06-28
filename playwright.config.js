const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium', headless: true, viewport: { width: 1280, height: 800 } }
    }
  ],
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]]
});

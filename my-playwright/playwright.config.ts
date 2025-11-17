import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testIgnore: ['admin_tests/**/*'], // 不要テストを無視
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      }
    },
  ],

  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
  timeout: 30000,

  use: {
    baseURL: 'https://dev.d1x2fefh4glbva.amplifyapp.com',
    storageState: 'storage/auth.json',
    headless: process.env.CI ? true : false, // CI ではヘッドレス
    screenshot: 'only-on-failure',
    video: 'on',
  },
});

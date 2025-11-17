import { defineConfig, devices } from '@playwright/test';

console.log(":めくったページ: config 読み込まれたよ！");

export default defineConfig({
  testDir: 'tests',

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
    baseURL: 'https://dev.d1x2fefh4glbva.amplifyapp.com/auth/sign-in',
    storageState: 'storage/auth.json',
    headless: false,
    screenshot: 'only-on-failure',
    video: 'on',
  },
});

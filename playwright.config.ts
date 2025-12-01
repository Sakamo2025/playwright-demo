import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // ▼★ここを追加（テストを直列にする）
  workers: 1,

  use: {
    headless: true,
    storageState: path.resolve(__dirname, './storage/auth.json'),
  },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  use: {
    headless: true,
    storageState: path.resolve(__dirname, './storage/auth.json'), // ← これでOK
  },
  reporter: [
    ['list'], // 👈 これ追加// 
    ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
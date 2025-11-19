/* eslint-disable @typescript-eslint/no-var-requires */

import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  use: {
    headless: true,  // ← ここを追加
    storageState: path.resolve(__dirname, 'storage/auth.json'),
    // ここに共通のブラウザ設定を追加できます
  },
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]], // ← これを追加
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

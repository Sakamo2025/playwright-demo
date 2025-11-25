import { test as baseTest } from '@playwright/test';

export const test = baseTest.extend({
  page: async ({ browser }, use) => {
    // storageState を使ってログイン済み状態の context を作る
    const context = await browser.newContext({ storageState: 'storage/auth.json' });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

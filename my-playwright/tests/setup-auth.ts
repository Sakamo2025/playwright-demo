import { test } from '@playwright/test';

test('ログインしてストレージ保存', async ({ page }) => {
  await page.goto('https://dev.d5q9i5ebfuc1x.amplifyapp.com/');

  await page.fill('input[name="email"]', process.env.LOGIN_EMAIL!);
  await page.fill('input[name="password"]', process.env.LOGIN_PASSWORD!);
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard');

  // 👇 認証状態を保存
  await page.context().storageState({ path: 'storage/auth.json' });
});

import { test, expect } from '@playwright/test';

test.describe('ログイン後、任意のアカウント詳細へ', () => {
  test('認証をクリアし、ログイン後に任意のアカウントをクリック', async ({ page }) => {
    await page.goto('https://dev.d5q9i5ebfuc1x.amplifyapp.com/');
    await page.locator('tr', { hasText: 'mac01' }).click();
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/.*\/admin\/users\/.*/);
  });
});


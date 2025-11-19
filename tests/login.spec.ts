import { test, expect } from '@playwright/test';

test.describe('@setup ログイン後、任意のアカウント詳細へ', () => {
  test('認証をクリアし、ログイン後に任意のアカウントをクリック', async ({ page }) => {
    await page.goto('https://dev.d5q9i5ebfuc1x.amplifyapp.com/');
    
    // 任意のアカウント行をクリック
    await page.locator('tr', { hasText: 'mac01' }).click();

    // ページ遷移待機
    await page.waitForTimeout(3000);

    await expect(page).toHaveURL(/.*\/admin\/users\/.*/);
  });
});


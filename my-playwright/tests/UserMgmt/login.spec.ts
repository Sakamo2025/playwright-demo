import { test, expect } from '@playwright/test';

test.use({ storageState: 'storage/auth.json' });

test.describe('ログイン後、任意のアカウント詳細へ', () => {
  test('認証をクリアし、ログイン後に任意のアカウントをクリック', async ({ page }) => {
    
    await page.goto('https://dev.d5q9i5ebfuc1x.amplifyapp.com/');

    // 「mac01」を含む行を探して「開く」ボタンをクリック
    await page.locator('tr', { hasText: 'mac01' }).click();

    await page.waitForTimeout(3000);

    // ユーザー詳細ページが表示されることを確認
    await expect(page).toHaveURL(/.*\/admin\/users\/.*/);

    await page.screenshot({ path: 'user-list.png', fullPage: true });
  });
}); 
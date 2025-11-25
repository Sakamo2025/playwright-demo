import { test } from '../fixtures.ts';
import { expect } from '@playwright/test';

test.describe('@setup ログイン後、任意のアカウント詳細へ', () => {
  test('ユーザー一覧から任意の行を開いて診察一覧の閲覧', async ({ page }) => {  
    await page.goto('https://stg.d5q9i5ebfuc1x.amplifyapp.com/');

    // :white_check_mark: 「mac01」を含む行を探して「開く」ボタンをクリック
    await page.locator('tr', { hasText: 'mac01' }).click();
    await page.waitForTimeout(3000);
  
    // :white_check_mark: ユーザー詳細内の「診察一覧」ボタンをクリック
    await page.getByRole('link', { name: '診察一覧' }).click();
    await page.waitForTimeout(3000); // 3秒（3000ミリ秒）待機
  
    // :white_check_mark: 診察一覧の1番上にある「詳細」ボタンをクリック
    await page.getByRole('link', { name: '詳細' }).nth(0).click(); // 最初の「詳細」
    await page.waitForTimeout(3000); // 3秒（3000ミリ秒）待機
  
    // :white_check_mark: 診察詳細内に「AP情報」「AI要約」があるか確認
    await expect(page.getByText('AP情報')).toBeVisible();
    await expect(page.getByText('AI要約')).toBeVisible();

  });    
});
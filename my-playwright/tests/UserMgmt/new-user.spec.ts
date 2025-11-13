import { test, expect } from '@playwright/test';

test.use({ storageState: 'storage/auth.json' });

test.describe('ログイン後、任意のアカウント詳細へ', () => {
  test('認証をクリアし、ログイン後に任意のアカウントをクリック', async ({ page }) => {
    
    await page.goto('https://dev.d5q9i5ebfuc1x.amplifyapp.com/');

    // ✅ 「新規ユーザー追加」ボタンをクリック
    await page.getByRole('button', { name: '新規ユーザー追加' }).click();
    await page.waitForTimeout(3000);

    // ✅ モーダル内の「キャンセル」ボタンをクリック
    await page.getByRole('button', { name: 'キャンセル' }).click();
    await page.waitForTimeout(3000);

    // ✅ 「新規ユーザー追加」ボタンをクリック
    await page.getByRole('button', { name: '新規ユーザー追加' }).click();

    // ✅ モーダル内にある場合
    const modal = page.locator('div[role="dialog"]');
    // ✅ モーダルが描画されるまで待つ
    await modal.waitFor();
    await modal.locator('input[placeholder="施設名を入力して検索"]').click();

    // ✅ 項目（例: アメリカパビリオン）をクリック
    await page.getByRole('button', { name: 'アメリカパビリオン（再追加）' }).click();

    // ✅ ラベル「施設」のあるフォームブロックを起点にする
    const facilityBlock = page.locator('label:text("施設")').locator('..').locator('..');

    // ✅ その中の「選択中: アメリカパビリオン」を検証
    await expect(facilityBlock.getByText('選択中: アメリカパビリオン（再追加）')).toBeVisible();

    // ✅ モーダル内の「名前」欄に入力
    await page.getByLabel('名前').fill('play wrighter');

    // ✅ モーダル内の「メールアドレス」欄に入力
    await page.getByLabel('メールアドレス').fill('playwright-test@medimo.ai');
    await page.waitForTimeout(3000);

    // ✅ モーダル内の「登録」ボタンをクリック
    await modal.getByRole('button', { name: '登録' }).click();
    await page.waitForTimeout(1000);

  });    
});
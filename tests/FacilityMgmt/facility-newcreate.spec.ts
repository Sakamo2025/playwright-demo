import { test } from '../fixtures.ts';
import { expect } from '@playwright/test';

test.describe('@setup ログイン後、グループ一覧へ', () => {
    test('施設新規登録', async ({ page }) => {
        test.setTimeout(90000);

        // ====== 今日の日時（YYYYMMDDHHMMSS）を生成 ======
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const mi = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');

        const timestamp = `${yyyy}${mm}${dd}${hh}${mi}${ss}`;
        // =========================================

        // 動的に日付時刻を付けた名前を定義
        const facilityName = `Playwright施設_新規作成${timestamp}`;
        const userName = `Playwrightユーザー_施設確認${timestamp}`;
        const email = `keiichi.sakamoto+stgpw${timestamp}@medimo.ai`;

        await page.goto('https://stg.d5q9i5ebfuc1x.amplifyapp.com/');

        // 施設一覧
        await page.getByRole('link', { name: '施設一覧' }).first().click();
        await page.getByRole('button', { name: '新規施設登録' }).click();
        await page.getByRole('button', { name: '登録' }).click();

        // 施設名のバリデーション確認
        const facilityGroup = page.getByLabel('施設名').locator('..');
        await expect(facilityGroup.getByText('必須項目です')).toBeVisible();

        // 施設登録
        await page.getByRole('textbox', { name: '施設名' }).fill(facilityName);
        await page.getByRole('button', { name: '登録' }).click();
        await page.getByRole('cell', { name: facilityName }).click();

        // ユーザー追加に追加した施設が表示されるか確認
        await page.getByRole('link', { name: 'ユーザー一覧' }).first().click();
        await page.getByRole('button', { name: '新規ユーザー追加' }).click();

        // 検索
        await page.getByRole('textbox', { name: '施設名を入力して検索' }).fill(facilityName);

        // 候補を待つ
        const option = page.getByRole('button', { name: facilityName });
        await expect(option).toBeVisible({ timeout: 10000 });

        // 候補クリック
        await option.click();

        // 施設が選択されたことを確認
        await expect(
            page.getByText(`選択中: ${facilityName}`)
        ).toBeVisible({ timeout: 5000 });
        await page.getByRole('button', { name: 'キャンセル' }).click();
    });
});
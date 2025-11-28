import { test } from '../fixtures.ts';
import { expect } from '@playwright/test';

test.describe('@setup ログイン後、任意のアカウント詳細へ', () => {
    test('アカウント詳細からユーザー辞書一覧へ移動し、辞書の更新', async ({ page }) => {
        test.setTimeout(60000);

        // :white_check_mark: 今日の日付を生成
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}/${mm}/${dd}`;

        await page.goto('https://stg.d5q9i5ebfuc1x.amplifyapp.com/');

        // :white_check_mark: 「ユーザー辞書01」を含む行を探して「開く」ボタンをクリック
        await page.locator('tr:has-text("ユーザー辞書01")').click();
        await page.waitForTimeout(3000);

        // :white_check_mark: ユーザー辞書の作成
        await page.getByRole('link', { name: 'ユーザー辞書一覧' }).click();
        await page.waitForTimeout(3000);

        await page.getByRole('button', { name: '新規作成' }).click();
        await page.waitForTimeout(1000);

        await page.fill('input[name="title"]', 'playwright_新規辞書作成');
        await page.getByRole('button', { name: '作成' }).click();
        await page.waitForTimeout(1000);

        // :white_check_mark: ユーザー辞書が2つ以上作成できないか（トーストのバリデーションアサーション）
        await page.getByRole('button', { name: '新規作成' }).click();
        await page.waitForTimeout(1000);

        await page.fill('input[name="title"]', 'playwright_新規辞書重複不可確認');
        await page.getByRole('button', { name: '作成' }).click();
        await page.waitForTimeout(10000);

        // :white_check_mark: 辞書名更新
        await page.getByRole('button', { name: '編集' }).click();
        await page.getByRole('textbox', { name: '辞書名' }).click();
        await page.getByRole('textbox', { name: '辞書名' }).fill('playwright_新規辞書作成（更新）');
        await page.getByRole('button', { name: '更新' }).click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByText('playwright_新規辞書作成（更新）')).toBeVisible({ timeout: 10000 });

        // :white_check_mark: 辞書削除
        await page.getByRole('button', { name: '削除' }).click();
        await page.getByRole('button', { name: '削除' }).click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByText('playwright_新規辞書作成（更新）')).not.toBeVisible({ timeout: 10000 });

    });
});
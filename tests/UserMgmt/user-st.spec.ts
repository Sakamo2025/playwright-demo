import { test, expect } from '@playwright/test'

test.describe('@setup ログイン後、任意のアカウント詳細へ', () => {
    test('任意ユーザーの要約テンプレートを開いて、プロンプトの新規/編集/削除', async ({ page }) => {  
        test.setTimeout(60000); 

        await page.goto('https://stg.d5q9i5ebfuc1x.amplifyapp.com/');

        // 「mac01」を含む行を探して「開く」ボタンをクリック
        await page.locator('tr', { hasText: 'mac01' }).click();
        await page.waitForTimeout(3000);

        await page.getByRole('link', { name: '要約テンプレート一覧' }).click();
        await page.waitForTimeout(3000);

        await page.getByRole('link', { name: '新規作成' }).click();
        await page.waitForTimeout(3000);

        await page.fill('input[name="title"]', 'playwrightタイトル入力');
        await page.fill('textarea[name="prompt"]', 'playwrightプロンプト入力');
        await page.waitForTimeout(3000);

        await page.getByRole('link', { name: 'キャンセル' }).click();
        await page.waitForTimeout(1000);

        await page.getByRole('link', { name: '新規作成' }).click();
        await page.waitForTimeout(3000);

        await page.fill('input[name="title"]', 'playwrightタイトル入力');
        await page.fill('textarea[name="prompt"]', 'playwrightプロンプト入力');
        await page.waitForTimeout(3000);

        await page.getByRole('button', { name: '追加' }).click();
        await page.waitForTimeout(1000);
        await page.getByRole('link', { name: 'キャンセル' }).click();
        await page.waitForTimeout(1000);

        await page.locator('a:has-text("編集")').last().click();
        await page.waitForTimeout(1000);

        await page.fill('input[name="title"]', '（編集）playwrightタイトル入力');
        await page.fill('textarea[name="prompt"]', '（編集）playwrightプロンプト入力');
        await page.waitForTimeout(1000);
        await page.getByRole('button', { name: '保存' }).click();
        await page.waitForTimeout(1000);
        await page.getByRole('link', { name: 'キャンセル' }).click();
        await page.waitForTimeout(1000);

        page.once('dialog', async dialog => {
            console.log(dialog.message());
            await dialog.dismiss(); // :x: キャンセル
        });
        await page.locator('button:has-text("削除")').last().click();
        await page.waitForTimeout(1000);

        page.once('dialog', async dialog => {
            console.log(dialog.message()); 
            await dialog.accept(); // :white_check_mark: OK
        });
        await page.locator('button:has-text("削除")').last().click();
        await page.waitForTimeout(1000);
  });    
});
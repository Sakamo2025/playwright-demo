import { test } from '../fixtures.ts';
import { expect } from '@playwright/test';

test.describe('@setup ログイン後、グループ一覧へ', () => {
    test('グループ一覧_全体フロー', async ({ page }) => {
        test.setTimeout(90000); // 実行時間を余裕めに延長

        await page.goto('https://stg.d5q9i5ebfuc1x.amplifyapp.com/');

        // --- サブスクありグループ検証 ---
        await page.getByRole('link', { name: 'グループ一覧' }).first().click();
        await page.getByRole('cell', { name: 'Playwrightグループ_サブスクあり' }).click();
        await page.getByRole('cell', { name: 'Playwrightプラン' }).first().click();

        // サブスクプラン画面へ遷移確認
        await expect(page.getByRole('heading', { name: 'サブスクリプション概要' })).toBeVisible();
        await page.goBack();

        // サブスク重複登録のバリデーション確認
        await page.getByRole('button', { name: 'サブスクリプション登録(グループ)' }).click();
        await page.getByRole('button', { name: 'プランを選択' }).click();
        await page.getByRole('button', { name: '2 Playwrightプラン 10,000円 10,' }).click();

        // 当日の日付を動的に入力
        const today = new Date().toISOString().split('T')[0];
        await page.getByRole('textbox', { name: '開始日' }).fill(today);
        await page.getByRole('button', { name: '登録' }).click();

        // 表示されるバリデーションメッセージを確認
        await expect(page.getByText('期間が重複するサブスクリプションが 存在します')).toBeVisible();

        await page.getByRole('button', { name: 'キャンセル' }).click();
        await page.getByRole('button', { name: 'グループ編集' }).click();

        // グループ名・メールアドレスの更新 + 表示される管理施設確認
        await page.getByRole('textbox', { name: 'グループ名' }).fill('Playwrightグループ_サブスクあり(更新)');
        await page.getByRole('textbox', { name: 'メールアドレス' }).fill('keiichi.sakamoto+stg_pwgroup0202@medimo.ai');

        // 検索ボックスに文字を入力し、結果確認
        await page.getByRole('textbox', { name: '施設名で検索' }).fill('サブ');

        // 表示されない施設を確認
        // 別グループとは未連携＆サブスク登録ユーザーを含む施設は表示されない
        const absentItem = page.locator('li', { hasText: 'Playwright施設_ユーザーサブスクあり' });
        await expect(absentItem).toHaveCount(0);

        // 表示されている施設を追加→削除→更新
        const visibleFacility = page.getByRole('button', { name: 'Playwright施設_ユーザーサブスクなし' });
        await expect(visibleFacility).toBeVisible();
        await visibleFacility.click();

        await page.getByRole('button', { name: 'Playwright施設_ユーザーサブスクなしを削除' }).click();
        await page.getByRole('button', { name: '更新' }).click();

        // 施設一覧からユーザーサブスクのサブクスを削除
        await page.getByRole('link', { name: '施設一覧' }).first().click();
        await page.getByRole('cell', { name: 'Playwright施設_ユーザーサブスクあり' }).click();
        await page.getByRole('cell', { name: 'Playwrightユーザー02_サブスクあり' }).click();
        await page.getByRole('button', { name: 'メニューを開く' }).click();

        // 削除ボタンを待機
        await page.waitForSelector('button:has-text("削除")', { timeout: 3000 });

        // Chromeダイアログ（OKで削除）
        page.once('dialog', async dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            await dialog.accept();
        });

        await page.getByRole('button', { name: '削除' }).click();

        // 削除後確認
        await page.waitForSelector('text=データがありません', { timeout: 5000 });
        await expect(page.getByText('データがありません')).toBeVisible();

        // グループ編集画面で管理施設の再確認
        await page.getByRole('link', { name: 'グループ一覧' }).first().click();
        await page.getByRole('cell', { name: 'Playwrightグループ_サブスクあり(更新)' }).click();
        await page.getByRole('button', { name: 'グループ編集' }).click();

        // 施設の再検索・再追加
        // ユーザーサブスクあり、ユーザーサブスクなし、どちらの施設も表示されることの確認
        await page.getByRole('textbox', { name: '施設名で検索' }).fill('サブ');
        await page.getByRole('button', { name: 'Playwright施設_ユーザーサブスクあり' }).click();
        await page.getByRole('textbox', { name: '施設名で検索' }).fill('サブ');
        await page.getByRole('button', { name: 'Playwright施設_ユーザーサブスクなし' }).click();

        // 施設削除 + 情報を元に戻す
        await page.getByRole('button', { name: 'Playwright施設_ユーザーサブスクありを削除' }).click();
        await page.getByRole('button', { name: 'Playwright施設_ユーザーサブスクなしを削除' }).click();
        await page.getByRole('textbox', { name: 'グループ名' }).fill('Playwrightグループ_サブスクあり');
        await page.getByRole('textbox', { name: 'メールアドレス' }).fill('keiichi.sakamoto+stg_pwgroup02@medimo.ai');
        await page.getByRole('button', { name: '更新' }).click();

        // ユーザー02のサブスクを初期値に戻す
        await page.getByRole('link', { name: 'ユーザー一覧' }).first().click();
        await page.getByRole('cell', { name: 'Playwrightユーザー02_サブスクあり' }).click();
        await page.getByRole('button', { name: 'サブスクリプションを作成する' }).click();
        await page.getByRole('button', { name: 'プランを選択' }).click();
        await page.getByRole('button', { name: '2 テスト用_Standard 49,500' }).click();

        // 当日の日付を再利用
        await page.getByRole('textbox', { name: '開始日' }).fill(today);
        await page.getByRole('button', { name: '登録' }).click();
        await page.getByRole('button', { name: 'キャンセル' }).click();


        // --- サブスクなしグループ検証 ---
        await page.getByRole('link', { name: 'ユーザー一覧' }).first().click();
        await page.getByRole('cell', { name: 'Playwrightユーザー01_サブスクなし' }).click();
        await expect(page.getByRole('cell', { name: 'データがありません' })).toBeVisible();

        // サブスクなしグループに施設が表示されていないことを確認
        await page.getByRole('link', { name: 'グループ一覧' }).first().click();
        await page.getByRole('cell', { name: 'Playwrightグループ_サブスクなし' }).click();
        await page.getByRole('button', { name: '施設' }).click();
        await expect(page.getByRole('cell', { name: 'データがありません' })).toBeVisible();

        // サブスク未登録ユーザーを含む施設は表示されることを確認
        await page.getByRole('button', { name: 'グループ編集' }).click();
        await page.getByRole('textbox', { name: '施設名で検索' }).click();
        await page.getByRole('textbox', { name: '施設名で検索' }).fill('サブ');
        await page.getByRole('button', { name: 'Playwright施設_ユーザーサブスクなし' }).click();
        await page.getByRole('button', { name: '更新' }).click();

        // 施設タブに登録した施設が反映されることを確認
        await page.waitForSelector('text=Playwright施設_ユーザーサブスクなし', { timeout: 5000 });
        await expect(page.getByRole('cell', { name: 'Playwright施設_ユーザーサブスクなし' })).toBeVisible();

        // グループから管理施設を削除できることを確認
        await page.getByRole('button', { name: 'グループ編集' }).click();
        await page.getByRole('button', { name: 'Playwright施設_ユーザーサブスクなしを削除' }).click();
        await page.getByRole('button', { name: '更新' }).click();
        await expect(page.getByRole('cell', { name: 'データがありません' })).toBeVisible();

    });
});
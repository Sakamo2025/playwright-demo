import { test } from '../fixtures.ts';
import { expect } from '@playwright/test';

test.describe('@setup ログイン後、グループ一覧へ', () => {
    test('グループ一覧_新規グループ登録', async ({ page }) => {
        test.setTimeout(90000); // 実行時間を余裕めに延長
        await page.goto('https://stg.d5q9i5ebfuc1x.amplifyapp.com/');

        // --- 新規グループ登録 ---

        // 今日の日付を生成
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        // 形式別
        const dateYYYYMMDD = `${year}${month}${day}`;       // 20251117
        const dateHyphen = `${year}-${month}-${day}`;       // 2025-11-17

        // グループ名
        const groupName = `Playwrightグループ_新規作成${dateYYYYMMDD}`;

        // メールアドレス
        const email = `keiichi.sakamoto+stg_pwgroup.create${dateYYYYMMDD}@medimo.ai`;

        // --- テスト処理 ---
        await page.getByRole('link', { name: 'グループ一覧' }).first().click();
        await page.getByRole('button', { name: '新規グループ登録' }).click();
        await page.getByRole('textbox', { name: 'グループ名' }).click();
        await page.getByRole('textbox', { name: 'グループ名' }).fill(groupName);
        await page.getByRole('button', { name: '登録' }).click();

        await expect(page.getByText('メールアドレスの形式で入力してください')).toBeVisible();
        await page.getByRole('textbox', { name: 'メールアドレス' }).fill(email);
        await page.getByRole('button', { name: '登録' }).click();
        await page.waitForTimeout(1000);

        await page.locator('table tbody tr').first().click();
        await expect(page.getByText(groupName)).toBeVisible();

        await page.getByRole('button', { name: 'サブスクリプション登録(グループ)' }).click();
        await page.getByRole('button', { name: 'プランを選択' }).click();
        await page.getByRole('button', { name: '2 Playwrightプラン 10,000円 10,' }).click();

        await page.getByRole('textbox', { name: '開始日' }).fill(dateHyphen); // ← 自動で当日の YYYY-MM-DD


        // --- 終了日：1か月後 -1日 が設定されているか確認 ---
        const startDateStr = await page.getByRole('textbox', { name: '開始日' }).inputValue();
        const startDate = new Date(startDateStr.replace(/-/g, '/'));

        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(endDate.getDate() - 1);

        const endYear = endDate.getFullYear();
        const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
        const endDay = String(endDate.getDate()).padStart(2, '0');
        const expectedEndDateStr = `${endYear}-${endMonth}-${endDay}`;

        const actualEndDate = await page.getByRole('textbox', { name: '終了日' }).inputValue();
        await expect(actualEndDate).toBe(expectedEndDateStr);

        await page.getByRole('button', { name: '登録' }).click();
        await page.waitForTimeout(1000);

        await page.getByRole('button', { name: 'キャンセル' }).click();
        await page.waitForTimeout(1000);

        // 再度サブスク登録モーダルを開く
        await page.getByRole('button', { name: 'サブスクリプション登録(グループ)' }).click();
        await page.waitForTimeout(1000);
        await page.getByRole('button', { name: 'プランを選択' }).click();
        await page.getByRole('button', { name: '2 Playwrightプラン 10,000円 10,' }).click();

        // 1回目終了日を取得
        const firstSubscriptionEnd = actualEndDate;

        // 開始日に重複日を入力
        const startInput = page.getByRole('textbox', { name: '開始日' });
        await startInput.fill(firstSubscriptionEnd);

        // 自動計算された終了日を入力（正常フォーマットチェックはしなくてOK）
        await startInput.press('Tab');

        // 登録ボタン押下
        await page.getByRole('button', { name: '登録' }).click();

        // 期間重複でバリデーションメッセージの確認
        await expect(page.getByText('期間が重複するサブスクリプションが 存在します')).toBeVisible();

        // --- 2回目登録：開始日を1か月後に変更して正常登録 ---

        // 今日の日付を基準に1か月後を計算
        const startDateObj = new Date(startDateStr.replace(/-/g, '/'));
        const secondStartDateObj = new Date(startDateObj);
        secondStartDateObj.setMonth(secondStartDateObj.getMonth() + 1);

        // 月末ズレ対応（setMonthで日付がずれる場合）
        if (secondStartDateObj.getDate() !== startDateObj.getDate()) {
            secondStartDateObj.setDate(0);
        }

        const secondYear = secondStartDateObj.getFullYear();
        const secondMonth = String(secondStartDateObj.getMonth() + 1).padStart(2, '0');
        const secondDay = String(secondStartDateObj.getDate()).padStart(2, '0');
        const secondStartDateStr = `${secondYear}-${secondMonth}-${secondDay}`;

        // 開始日を1か月後に変更
        await startInput.fill(secondStartDateStr);
        await startInput.press('Tab'); // 終了日を自動計算させる場合

        // 登録ボタン押下
        await page.getByRole('button', { name: '登録' }).click();


        // 登録成功のメッセージ確認
        await expect(page.getByText('サブスクリプションを作成しました')).toBeVisible();
        await page.getByRole('button', { name: 'キャンセル' }).click();
        await page.waitForTimeout(1000);

        // 登録後、一覧で反映確認
        await expect(page.getByText(groupName)).toBeVisible();

        // 登録後、一覧テーブルが描画されるまで待つ
        const rows = page.locator('table tbody tr');
        await rows.first().waitFor({ state: 'visible' }); // 1行目が描画されるまで待機

        // 件数確認
        await expect(rows).toHaveCount(2);
    });
});
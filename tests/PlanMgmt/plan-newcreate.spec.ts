import { test } from '../fixtures.ts';
import { expect } from '@playwright/test';

test.describe('@setup ログイン後、プラン一覧へ', () => {
    test('プラン管理_新規登録', async ({ page }) => {
        test.setTimeout(90000); // 実行時間を余裕めに延長

        await page.goto('https://stg.d5q9i5ebfuc1x.amplifyapp.com/');

        // プラン名に現在日時（yyyyMMddHHmm）を付与
        const now = new Date();
        const timestamp =
            now.getFullYear().toString() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0');

        const planName = `新規ユーザープラン登録_${timestamp}`;

        // 価格：30000〜500000 のランダム整数（100刻み）
        let price = Math.floor(Math.random() * (500000 - 30000 + 1)) + 30000;
        // 100 未満の端数を切り捨て
        price = Math.floor(price / 100) * 100;

        // 最大時間（分）：1000〜100000 のランダム整数（100刻み）
        let maxMinutes = Math.floor(Math.random() * (100000 - 1000 + 1)) + 1000;
        // 100 未満を切り捨て
        maxMinutes = Math.floor(maxMinutes / 100) * 100;


        // --- ユーザープラン新規登録 ---
        await page.getByRole('link', { name: 'プラン管理' }).first().click();
        await page.getByRole('button', { name: '新規ユーザープラン登録' }).click();

        // プラン名設定（当日）
        await page.getByRole('textbox', { name: 'プラン名' }).fill(planName);

        // 価格設定（ランダム整数）
        await page.getByRole('textbox', { name: '価格（円）' }).fill(price.toString());

        // 最大時間設定（ランダム整数）
        await page.getByRole('textbox', { name: '診察最大時間（分）' }).fill(maxMinutes.toString());

        // 待機ステップ
        //await page.waitForTimeout(5000); // 5秒待機

        // 作成ボタン押下-作成完了メッセージ確認
        await page.getByRole('button', { name: '作成' }).click();
        await expect(page.getByText('ユーザープランを作成')).toBeVisible();


        // ユーザー一覧のプランにて新規登録プランが表示されるか確認する
        await page.getByRole('link', { name: 'ユーザー一覧' }).first().click();
        await page.getByRole('cell', { name: 'Playwrightユーザー05_プラン管理' }).click();
        await page.getByRole('button', { name: 'サブスクリプションを作成する' }).click();
        await page.getByRole('button', { name: 'プランを選択' }).click();

        // プラン名のボタンをクリック
        await page.getByRole('button', { name: new RegExp(planName) }).click();

        // 開始日：今日の日付を自動入力
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        // 新規登録プランを任意ユーザーのサブスクとして登録できるか確認する
        await page.getByRole('textbox', { name: '開始日' }).fill(todayStr);

        await page.getByRole('button', { name: '登録', exact: true }).click();

        // 待機ステップ
        await page.waitForTimeout(3000); // 3秒待機

        // 登録後モーダルを閉じる
        await page.getByRole('button', { name: 'キャンセル' }).click();

        // 登録したサブスクを削除する
        await page.getByRole('button', { name: 'メニューを開く' }).click();
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

        // --- グループプラン新規登録 ---
        await page.getByRole('link', { name: 'プラン管理' }).first().click();
        await page.getByRole('button', { name: 'グループプラン' }).click();
        await page.getByRole('button', { name: '新規グループプラン登録' }).click();

        // プラン名に日付付与（yyyyMMddHHmm）
        const groupPlanName = `新規グループプラン登録_${timestamp}`; // timestamp は既存の now 変数を使用
        await page.getByRole('textbox', { name: 'プラン名' }).fill(groupPlanName);

        // 基本料金（円）：50000〜150000 ランダム整数（100刻み）
        let basePrice = Math.floor(Math.random() * (150000 - 50000 + 1)) + 50000;
        basePrice = Math.floor(basePrice / 100) * 100;
        await page.getByRole('textbox', { name: '基本料金（円）' }).fill(basePrice.toString());

        // 基本枠（分）：1000〜20000 ランダム整数（100刻み）
        let baseMinutes = Math.floor(Math.random() * (20000 - 1000 + 1)) + 1000;
        baseMinutes = Math.floor(baseMinutes / 100) * 100;
        await page.getByRole('textbox', { name: '基本枠（分）' }).fill(baseMinutes.toString());

        // 追加枠単価（円/分）：20〜90 ランダム整数
        let extraUnitPrice = Math.floor(Math.random() * (90 - 20 + 1)) + 20;
        await page.getByRole('textbox', { name: '追加枠単価（円/分）' }).fill(extraUnitPrice.toString());

        // 登録ボタン押下
        await page.getByRole('button', { name: '登録' }).click();

        // 待機ステップ
        await page.waitForTimeout(5000); // 5秒待機


        // グループ一覧のプランにて新規登録プランが表示されるか確認する
        await page.getByRole('link', { name: 'グループ一覧' }).first().click();
        await page.getByRole('cell', { name: 'stg専用_kamoグループ' }).click();
        await page.getByRole('button', { name: 'サブスクリプション登録(グループ)' }).click();
        await page.getByRole('button', { name: 'プランを選択' }).click();

        // テキストボックスに入力
        const planInput = page.getByRole('textbox', { name: 'プランを選択' });
        await planInput.fill(groupPlanName);

        // 候補リストからプラン名ボタンを取得
        const planButton = page.getByRole('button', { name: new RegExp(groupPlanName) });
        await expect(planButton).toBeVisible({ timeout: 15000 });

        // スクロールしてクリック可能にする
        await planButton.scrollIntoViewIfNeeded();
        await planButton.click({ force: true });

        // 開始日を入力
        const startDateInput = page.getByRole('textbox', { name: '開始日' });
        await startDateInput.fill(todayStr);

        // 登録ボタン
        const registerButton = page.locator('button.btn.btn-primary:has-text("登録")');
        await expect(registerButton).toBeVisible({ timeout: 15000 });
        await registerButton.scrollIntoViewIfNeeded();
        await registerButton.click({ force: true });
        await expect(planButton).toBeVisible({ timeout: 15000 });

        // 重複サブスクリプションの確認
        await expect(
            page.getByText('期間が重複するサブスクリプションが 存在します')
        ).toBeVisible();

    });
});
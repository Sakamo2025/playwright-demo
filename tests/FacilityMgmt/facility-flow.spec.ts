import { test } from '../fixtures.ts';
import { expect } from '@playwright/test';

test.describe('@setup ログイン後、グループ一覧へ', () => {
    test('施設一覧_全体フロー', async ({ page }) => {
        test.setTimeout(90000);
        await page.goto('https://stg.d5q9i5ebfuc1x.amplifyapp.com/');

        // 施設一覧にて連携しているグループを確認
        await page.getByRole('link', { name: '施設一覧' }).first().click();
        await page.getByRole('cell', { name: 'Playwright施設_グループ連携済' }).click();
        await expect(page.getByText('リグレッション用グループ')).toBeVisible();

        // グループ一覧にて施設連携解除
        await page.getByRole('link', { name: 'グループ一覧' }).first().click();
        await page.getByRole('cell', { name: 'リグレッション用グループ' }).click();
        await page.getByRole('button', { name: '施設' }).click();
        await expect(page.getByText('Playwright施設_グループ連携済')).toBeVisible();

        await page.getByRole('button', { name: 'グループ編集' }).click();
        await page.getByRole('button', { name: 'Playwright施設_グループ連携済を削除' }).click();
        await page.getByRole('button', { name: '更新' }).click();

        // 施設連携解除後、施設一覧にて所属グループ確認（解除されている為、所属なし）
        await page.getByRole('link', { name: '施設一覧' }).first().click();
        await page.getByRole('cell', { name: 'Playwright施設_グループ連携済' }).click();
        await expect(page.getByText('グループ所属なし')).toBeVisible();

        // グループ一覧にて施設再連携
        await page.getByRole('link', { name: 'グループ一覧' }).first().click();
        await page.getByRole('cell', { name: 'リグレッション用グループ' }).click();
        await page.getByRole('button', { name: 'グループ編集' }).click();
        await page.getByRole('textbox', { name: '施設名で検索' }).click();
        await page.getByRole('textbox', { name: '施設名で検索' }).fill('連携済');
        await page.getByRole('button', { name: 'Playwright施設_グループ連携済' }).click();
        await page.getByRole('button', { name: '更新' }).click();

        // グループの施設名から、施設画面の遷移確認
        await page.getByRole('button', { name: /^施設$/ }).click();
        await page.waitForTimeout(3000);
        await page.getByRole('cell', { name: 'Playwright施設_グループ連携済' }).click();
        await expect(page.getByText('リグレッション用グループ')).toBeVisible();
        await expect(page.getByText('データがありません')).toBeVisible();

        // 施設名編集・更新
        await page.getByRole('button', { name: '施設編集' }).click();
        await page.getByRole('textbox', { name: '施設名' }).click();
        await page.getByRole('textbox', { name: '施設名' }).fill('Playwright施設_グループ連携済（更新）');

        // 施設編集にてサブスク非加入ユーザーのみ表示されることの確認
        await page.getByRole('textbox', { name: '氏名・メールアドレスで検索' }).click();
        await page.getByRole('textbox', { name: '氏名・メールアドレスで検索' }).fill('サブ');
        await page.getByRole('button', { name: 'Playwrightユーザー01_サブスクなし' }).click();
        await page.getByRole('textbox', { name: '氏名・メールアドレスで検索' }).click();
        await page.getByRole('textbox', { name: '氏名・メールアドレスで検索' }).fill('サブ');
        await expect(page.getByText('該当するユーザーが見つかりません')).toBeVisible();
        await page.getByRole('button', { name: '更新' }).click();

        // サブスクありグループに所属している施設Aから該当ユーザーを解除
        await page.getByRole('link', { name: '施設一覧' }).first().click();
        await page.getByRole('cell', { name: 'Playwright施設_グループサブスクあり' }).click();
        await page.getByRole('button', { name: '施設編集' }).click();
        await page.getByRole('button', { name: 'Playwrightユーザー04_グループサブスクありを削除' }).click();
        await page.getByRole('button', { name: '更新' }).click();

        // 上記で連携解除したユーザーが別施設Bと連携できることを確認
        await page.getByRole('link', { name: '施設一覧' }).first().click();
        await page.getByRole('cell', { name: 'Playwright施設_グループ連携済（更新）' }).click();
        await page.getByRole('button', { name: '施設編集' }).click();
        await page.getByRole('textbox', { name: '氏名・メールアドレスで検索' }).click();
        await page.getByRole('textbox', { name: '氏名・メールアドレスで検索' }).fill('ユーザー04');
        await page.getByRole('button', { name: 'Playwrightユーザー04_グループサブスクあり' }).click();
        await page.getByRole('button', { name: '更新' }).click();
        await page.waitForTimeout(3000);

        // 連携したユーザーが表示されていることを確認
        const userTable = page.locator('table'); // ユーザー一覧テーブル
        await expect(userTable.getByText('Playwrightユーザー01_サブスクなし')).toBeVisible();
        await expect(userTable.getByText('Playwrightユーザー04_グループサブスクあり')).toBeVisible();


        // 施設Bに連携後、過去連携していた施設Aのユーザーに表示されないことを確認
        await page.getByRole('link', { name: '施設一覧' }).first().click();
        await page.getByRole('cell', { name: 'Playwright施設_グループサブスクあり' }).click();
        await page.getByRole('button', { name: '施設編集' }).click();
        await page.getByRole('textbox', { name: '氏名・メールアドレスで検索' }).click();
        await page.getByRole('textbox', { name: '氏名・メールアドレスで検索' }).fill('ユーザー04');
        await expect(page.getByText('該当するユーザーが見つかりません')).toBeVisible();
        await page.getByRole('heading', { name: '施設編集' }).click();
        await page.getByRole('button', { name: 'キャンセル' }).click();

        // 施設Bから連携ユーザーをすべて解除し、施設名を初期値へ戻す
        await page.getByRole('link', { name: '施設一覧' }).first().click();
        await page.getByRole('cell', { name: 'Playwright施設_グループ連携済（更新）' }).click();
        await page.getByRole('button', { name: '施設編集' }).click();
        await page.getByRole('textbox', { name: '施設名' }).click();
        await page.getByRole('textbox', { name: '施設名' }).fill('Playwright施設_グループ連携済');
        await page.getByRole('button', { name: 'Playwrightユーザー01_サブスクなしを削除' }).click();
        await page.getByRole('button', { name: 'Playwrightユーザー04_グループサブスクありを削除' }).click();
        await page.getByRole('button', { name: '更新' }).click();
        await expect(page.getByText('データがありません')).toBeVisible();

        // 施設とユーザー連携を初期値に戻す（施設Aとユーザー04連携）
        await page.getByRole('link', { name: '施設一覧' }).first().click();
        await page.getByRole('cell', { name: 'Playwright施設_グループサブスクあり' }).click();
        await page.getByRole('button', { name: '施設編集' }).click();
        await page.getByRole('textbox', { name: '氏名・メールアドレスで検索' }).fill('ユーザー04');
        await page.getByRole('button', { name: 'Playwrightユーザー04_グループサブスクあり' }).click();
        await page.getByRole('button', { name: '更新' }).click();
        
    });
});
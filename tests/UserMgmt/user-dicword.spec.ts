import { test } from '../fixtures.ts';
import { expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('@setup ユーザー辞書のCRUD + CSV + 検索 全体E2E', () => {
  // CI 運用を考えて長めに
  test.setTimeout(90000);
  test('ユーザー辞書 E2E 総合テスト', async ({ page }, testInfo) => {

    // ▼ Playwright の outputDir を使えば __dirnameÏ
    const fixturesDir = path.join(testInfo.outputDir, 'fixtures');
    fs.mkdirSync(fixturesDir, { recursive: true });

    const csvPath = path.join(fixturesDir, '単語フォーマット.csv');

    fs.writeFileSync(
      csvPath,
      `心筋硬塞,心筋梗塞
       高血圧症,高血圧
       党尿病,糖尿病
       腎不然,腎不全
       肺円,肺炎`,
      'utf-8'
    );

    // 今日の日付（アサーション用）
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}/${mm}/${dd}`;

    // ▼ login.setup.ts の storageState を利用してログイン後画面へ
    await page.goto('https://stg.d5q9i5ebfuc1x.amplifyapp.com/', {
      waitUntil: 'networkidle'
    });

    // ▼ ユーザーの1行クリック
    await page.locator('tr:has-text("ユーザー辞書01")').click();
    await page.waitForTimeout(500);

    // ▼ ユーザー辞書一覧
    await page.getByRole('link', { name: 'ユーザー辞書一覧' }).click();
    await page.waitForLoadState('networkidle');

    // ▼ 新規辞書作成
    await page.getByRole('button', { name: '新規作成' }).click();
    await page.fill('input[name="title"]', 'playwright_新規辞書作成');
    await page.getByRole('button', { name: '作成' }).click();
    await page.waitForTimeout(800);

    // ▼ 重複作成 → エラー確認
    await page.getByRole('button', { name: '新規作成' }).click();
    await page.fill('input[name="title"]', 'playwright_新規辞書重複不可確認');
    await page.getByRole('button', { name: '作成' }).click();

    await expect(
      page.getByText('辞書の作成に失敗しました', { exact: false })
    ).toBeVisible({ timeout: 7000 });

    // ▼ 単語一覧へ遷移
    await page.getByRole('link', { name: 'playwright_新規辞書作成' }).click();

    // ▼ 単語作成共通関数
    const addWord = async (correct: string, wrong: string) => {
      await page.getByRole('button', { name: '新規作成' }).click();
      await page.getByRole('textbox', { name: '正しい単語' }).fill(correct);
      await page.getByRole('textbox', { name: '誤変換単語' }).fill(wrong);
      await page.getByRole('button', { name: '作成' }).click();
      await page.waitForTimeout(700);
    };

    await addWord('心筋硬塞', '心筋梗塞');
    await addWord('貧血', '貧欠');

    // CSVインポートボタンを押す
    await page.getByRole('button', { name: 'CSVインポート' }).click();

    // ファイルをセット
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(csvPath);

    await expect(
      page.getByText('CSVファイルのインポートが完了しました', { exact: false })
    ).toBeVisible({ timeout: 5000 });

    // ▼ 重複単語エラー
    await addWord('心筋梗塞', '心筋硬塞');

    await expect(
      page.getByText('The Dictionary Item already exists.', { exact: false })
    ).toBeVisible({ timeout: 5000 });

    // ▼ 編集： 高血圧 → 高血圧症
    const row = page.locator(`tr:has-text("高血圧")`);
    await row.first().waitFor({ state: 'visible', timeout: 10000 });
    await row.first().getByRole('button').click({ force: true });

    await page.getByRole('textbox', { name: '正しい単語' }).fill('高血圧症');
    await page.getByRole('textbox', { name: '誤変換単語' }).fill('高血圧');
    await page.getByRole('button', { name: '更新' }).click();

    // ▼ 肺炎を削除
    const pneumoniaRow = `肺炎 肺円 ${todayStr} 編集`;

    await page.getByRole('row', { name: pneumoniaRow })
      .getByRole('checkbox').check();

    await page.getByRole('button', { name: '選択項目を削除' }).click();
    await page.getByRole('button', { name: '削除' }).click();

    await expect(page.getByText('肺炎')).not.toBeVisible({ timeout: 10000 });

    // ▼ 検索
    await page.getByRole('textbox', { name: '単語を検索' }).fill('心筋梗塞');
    await page.getByRole('textbox', { name: '単語を検索' }).press('Enter');

    const results = page.locator('table tbody tr');

    await expect(results).toHaveCount(2);
    await page.waitForTimeout(700);

    // ▼ 検索結果2件削除
    await page.getByRole('row', { name: '正しい単語 誤変換単語 作成日時' })
      .getByRole('checkbox').check();

    await page.getByRole('button', { name: '選択項目を削除' }).click();
    await page.getByRole('button', { name: '削除' }).click();

    await page.waitForLoadState('networkidle');
    await expect(results).toHaveCount(0);

    // ▼ 検索解除 → 4件に戻る
    await page.getByRole('textbox', { name: '単語を検索' }).fill('');
    await page.getByRole('textbox', { name: '単語を検索' }).press('Enter');

    await page.waitForLoadState('networkidle');
    await expect(results).toHaveCount(4, { timeout: 10000 });

    // ▼ 辞書名を更新
    await page.getByRole('link', { name: '辞書一覧へ戻る' }).click();
    await page.getByRole('button', { name: '編集' }).click();

    await page.getByRole('textbox', { name: '辞書名' })
      .fill('playwright_新規辞書作成（更新）');

    await page.getByRole('button', { name: '更新' }).click();

    await expect(
      page.getByText('playwright_新規辞書作成（更新）')
    ).toBeVisible({ timeout: 10000 });

    // ▼ 辞書削除
    await page.getByRole('button', { name: '削除' }).click();
    await page.getByRole('button', { name: '削除' }).click();

    await expect(
      page.getByText('playwright_新規辞書作成（更新）')
    ).not.toBeVisible({ timeout: 10000 });

  });
});

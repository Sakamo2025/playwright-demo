// @ts-nocheck
const { test, expect } = require('@playwright/test');
const path = require('path');

test('ユーザー一覧から任意の行を開いて診察一覧の閲覧', async ({ page }) => {  
  test.setTimeout(60000); 

 // ✅ 今日の日付を生成
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}/${mm}/${dd}`;

  await page.goto('https://dev.d5q9i5ebfuc1x.amplifyapp.com/');

  // ✅ 「mac02」を含む行を探して「開く」ボタンをクリック
  await page.locator('tr:has-text("mac02")').click();
  await page.waitForTimeout(3000);

  // ✅ ユーザー辞書の作成
  await page.getByRole('link', { name: 'ユーザー辞書一覧' }).click();
  await page.waitForTimeout(3000);

  await page.getByRole('button', { name: '新規作成' }).click();
  await page.waitForTimeout(1000);

  await page.fill('input[name="title"]', 'playwright_新規辞書作成');
  await page.getByRole('button', { name: '作成' }).click();
  await page.waitForTimeout(1000);

  // ✅ ユーザー辞書が2つ以上作成できないか（トーストのバリデーションアサーション）
  await page.getByRole('button', { name: '新規作成' }).click();
  await page.waitForTimeout(1000);

  await page.fill('input[name="title"]', 'playwright_新規辞書重複不可確認');
  await page.getByRole('button', { name: '作成' }).click(); 

  await expect(page.getByText('辞書の作成に失敗しました', { exact: false })).toBeVisible({ timeout: 5000 });

  // ✅ ユーザー辞書の単語一覧へ遷移
  await page.getByRole('link', { name: 'playwright_新規辞書作成' }).click();

  // ✅ 単語も新規作成
  await page.getByRole('button', { name: '新規作成' }).click();
  await page.waitForTimeout(1000);

  await page.getByRole('textbox', { name: '正しい単語' }).fill('心筋梗塞');
  await page.getByRole('textbox', { name: '誤変換単語' }).fill('心筋硬塞');
  await page.getByRole('button', { name: '作成' }).click();
  await page.waitForTimeout(1000);

  await page.getByRole('button', { name: '新規作成' }).click();
  await page.waitForTimeout(1000);

  await page.getByRole('textbox', { name: '正しい単語' }).fill('貧血');
  await page.getByRole('textbox', { name: '誤変換単語' }).fill('貧欠');
  await page.getByRole('button', { name: '作成' }).click();
  await page.waitForTimeout(1000);

  // ✅ CSVインポート
  await page.getByRole('button', { name: 'CSVインポート' }).click();

  const filePath = path.resolve(__dirname, '../../fixtures/単語フォーマット.csv');
  await page.setInputFiles('input[type="file"]', filePath);

  // ✅ ファイルが正しくセットされたことを検証
  const fileName = await page.$eval('input[type="file"]', el => el.files[0]?.name);
  expect(fileName).toBe('単語フォーマット.csv');

  // ✅ アップロード結果の反映確認（画面に「肺炎」が出るなど）
  await expect(page.getByText('肺炎')).toBeVisible({ timeout: 10000 });

  // ✅ 誤変換単語の重複不可確認
  await page.getByRole('button', { name: '新規作成' }).click();
  await page.waitForTimeout(1000);

  await page.getByRole('textbox', { name: '正しい単語' }).fill('心筋梗塞');
  await page.getByRole('textbox', { name: '誤変換単語' }).fill('心筋硬塞');
  await page.getByRole('button', { name: '作成' }).click();
  await page.waitForTimeout(1000);

  await expect(page.getByText('The Dictionary Item already exists.', { exact: false })).toBeVisible({ timeout: 5000 });

  // ✅ 高血圧 高血圧症 編集
  const rowName = `高血圧 高血圧症 ${todayStr} 編集`;
  await page.getByRole('row', { name: rowName }).getByRole('button').click();
  await page.getByRole('textbox', { name: '正しい単語' }).click();
  await page.getByRole('textbox', { name: '正しい単語' }).press('Enter');
  await page.getByRole('textbox', { name: '正しい単語' }).fill('高血圧症');
  await page.getByRole('textbox', { name: '誤変換単語' }).click();
  await page.getByRole('textbox', { name: '誤変換単語' }).fill('高血圧');
  await page.waitForTimeout(3000);

  await page.getByRole('button', { name: '更新' }).click();

  // ✅ 肺炎 削除
  const pneumoniaRow = `肺炎 肺円 ${todayStr} 編集`;
  await page.getByRole('row', { name: pneumoniaRow }).getByRole('checkbox').check();
  await page.getByRole('button', { name: '選択項目を削除' }).click();
  await page.getByRole('button', { name: '削除' }).click();
  await expect(page.getByText('肺炎')).not.toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(3000);

  // ✅ 検索検証
  await page.getByRole('textbox', { name: '単語を検索' }).click();
  await page.getByRole('textbox', { name: '単語を検索' }).fill('心筋梗塞');
  await page.getByRole('textbox', { name: '単語を検索' }).press('Enter');

  const results = page.locator('table tbody tr');
  await expect(results).toHaveCount(2);
  await page.waitForTimeout(3000);

  // ✅ 検索ヒットした単語削除
  await page.getByRole('row', { name: '正しい単語 誤変換単語 作成日時' }).getByRole('checkbox').check();
  await page.getByRole('button', { name: '選択項目を削除' }).click();
  await page.getByRole('button', { name: '削除' }).click();
  await page.waitForLoadState('networkidle');
  await expect(results).toHaveCount(0);

  // ✅ 検索解除
  await page.getByRole('textbox', { name: '単語を検索' }).click();
  await page.getByRole('textbox', { name: '単語を検索' }).fill('');
  await page.getByRole('textbox', { name: '単語を検索' }).press('Enter');
  await page.waitForLoadState('networkidle');
  await expect(results).toHaveCount(4);

  // ✅ 辞書名更新
  await page.getByRole('link', { name: '辞書一覧へ戻る' }).click();
  await page.getByRole('button', { name: '編集' }).click();
  await page.getByRole('textbox', { name: '辞書名' }).click();
  await page.getByRole('textbox', { name: '辞書名' }).fill('playwright_新規辞書作成（更新）');
  await page.getByRole('button', { name: '更新' }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('playwright_新規辞書作成（更新）')).toBeVisible({ timeout: 10000 });

  // ✅ 辞書削除
  await page.getByRole('button', { name: '削除' }).click();
  await page.getByRole('button', { name: '削除' }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('playwright_新規辞書作成（更新）')).not.toBeVisible({ timeout: 10000 });

});
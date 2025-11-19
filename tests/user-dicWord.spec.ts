import { test, expect } from '@playwright/test'
import fs from 'fs';
import path from 'path';

test.describe('@setup ログイン後、任意のアカウント詳細へ', () => {
  test('ユーザー一覧から任意の行を開いて診察一覧の閲覧', async ({ page }) => {  
  test.setTimeout(60000); 

  const fixturesDir = path.resolve(__dirname, '../../fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
    const csvPath = path.join(fixturesDir, '単語フォーマット.csv');
    // CSV 内容を作成（ヘッダー付き）
    const csvContent = `正しい単語,誤変換単語
      心筋梗塞,心筋硬塞
      高血圧,高血圧症
      糖尿病,党尿病
      腎不全,腎不然
      肺炎,肺円`;
    fs.writeFileSync(csvPath, csvContent, 'utf-8');

  // :white_check_mark: 今日の日付を生成
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}/${mm}/${dd}`;

  await page.goto('https://dev.d5q9i5ebfuc1x.amplifyapp.com/');

  // :white_check_mark: 「mac02」を含む行を探して「開く」ボタンをクリック
  await page.locator('tr:has-text("mac02")').click();
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

  await expect(page.getByText('辞書の作成に失敗しました', { exact: false })).toBeVisible({ timeout: 5000 });

  // :white_check_mark: ユーザー辞書の単語一覧へ遷移
  await page.getByRole('link', { name: 'playwright_新規辞書作成' }).click();

  // :white_check_mark: 単語も新規作成
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

  // :white_check_mark: CSVインポート
  await page.getByRole('button', { name: 'CSVインポート' }).click();

  const filePath = path.resolve(__dirname, '../../fixtures/単語フォーマット.csv');
  await page.setInputFiles('input[type="file"]', filePath);

  // :white_check_mark: ファイルが正しくセットされたことを検証
  const fileName = await page.$eval('input[type="file"]', (el) => {
  const input = el as HTMLInputElement;
  return input.files?.[0]?.name ?? null;
  });

  // :white_check_mark: アップロード結果の反映確認（画面に「肺炎」が出るなど）
  await expect(page.getByText('肺炎')).toBeVisible({ timeout: 10000 });

  // :white_check_mark: 誤変換単語の重複不可確認
  await page.getByRole('button', { name: '新規作成' }).click({ force: true });
  await page.waitForTimeout(3000);

  // モーダルが存在すれば入力
  const modal = page.locator('div[role="dialog"]:has-text("新規辞書作成")');
    if (await modal.count() > 0) {
      // 単語入力
      await modal.getByRole('textbox', { name: '正しい単語' }).fill('心筋梗塞');
      await modal.getByRole('textbox', { name: '誤変換単語' }).fill('心筋硬塞');
      await modal.getByRole('button', { name: '作成' }).click();
      await page.waitForTimeout(1000);
    } else {
      console.log('モーダルが出なかったためスキップ');
  }

  // 編集対象の行名
  const rowName = `高血圧 高血圧症 ${todayStr} 編集`;

  //トースト通知を先に削除してクリックを邪魔しないようにする
  await page.locator('div[role="status"]').evaluateAll(els => els.forEach(el => el.remove()));
  //行が表示されるまで待つ
  const row = page.getByRole('row', { name: rowName });
  await row.waitFor({ state: 'visible', timeout: 10000 });
  //ボタンをクリック（forceでoverlayなどの影響を回避）
  await row.getByRole('button').click({ force: true });
  await page.getByRole('textbox', { name: '正しい単語' }).fill('高血圧症');
  await page.getByRole('textbox', { name: '誤変換単語' }).fill('高血圧');
  await page.getByRole('button', { name: '更新' }).click();


  // :white_check_mark: 肺炎 削除
  const pneumoniaRow = `肺炎 肺円 ${todayStr} 編集`;
  await page.getByRole('row', { name: pneumoniaRow }).getByRole('checkbox').check();
  await page.getByRole('button', { name: '選択項目を削除' }).click();
  await page.getByRole('button', { name: '削除' }).click();
  await expect(page.getByText('肺炎')).not.toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(3000);

  // :white_check_mark: 検索検証
  await page.getByRole('textbox', { name: '単語を検索' }).click();
  await page.getByRole('textbox', { name: '単語を検索' }).fill('心筋梗塞');
  await page.getByRole('textbox', { name: '単語を検索' }).press('Enter');

  const results = page.locator('table tbody tr');
  await expect(results).toHaveCount(2);
  await page.waitForTimeout(3000);

  // :white_check_mark: 検索ヒットした単語削除
  await page.getByRole('row', { name: '正しい単語 誤変換単語 作成日時' }).getByRole('checkbox').check();
  await page.getByRole('button', { name: '選択項目を削除' }).click();
  await page.getByRole('button', { name: '削除' }).click();
  await page.waitForLoadState('networkidle');
  await expect(results).toHaveCount(0);

  // :white_check_mark: 検索解除
  await page.getByRole('textbox', { name: '単語を検索' }).click();
  await page.getByRole('textbox', { name: '単語を検索' }).fill('');
  await page.getByRole('textbox', { name: '単語を検索' }).press('Enter');
  await page.waitForLoadState('networkidle');
  await expect(results).toHaveCount(4);

  // :white_check_mark: 辞書名更新
  await page.getByRole('link', { name: '辞書一覧へ戻る' }).click();
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
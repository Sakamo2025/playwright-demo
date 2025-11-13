import { test } from '@playwright/test';
import path from 'path';

test('ログインしてストレージ保存', async ({ page }) => {
  // ✅ Secrets の環境変数チェック
  if (!process.env.LOGIN_EMAIL || !process.env.LOGIN_PASSWORD) {
    throw new Error('❌ LOGIN_EMAIL または LOGIN_PASSWORD が設定されていません。');
  }

  // ✅ ログインページへアクセス
  await page.goto('https://dev.d5q9i5ebfuc1x.amplifyapp.com/');

  // ✅ ログインフォームに入力
  await page.fill('input[name="email"]', process.env.LOGIN_EMAIL);
  await page.fill('input[name="password"]', process.env.LOGIN_PASSWORD);
  await page.click('button[type="submit"]');

  // ✅ ログイン完了待機（URL変化またはUI要素で）
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  // もしダッシュボードに特定のテキストやボタンが出るならこちらでもOK
  // await expect(page.getByText('ダッシュボード')).toBeVisible();

  // ✅ 保存パスを絶対パスで指定
  const authPath = path.resolve(__dirname, '../storage/auth.json');

  // ✅ 現在のコンテキストを保存
  await page.context().storageState({ path: authPath });

  console.log(`✅ 認証状態を保存しました: ${authPath}`);
});

import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('@setup 自動ログインして storageState を生成', async ({ page, browser }) => {

  // 1. ログインページへ
  await page.goto('https://stg.d5q9i5ebfuc1x.amplifyapp.com/');

  // ログインボタン押下
  await page.click('button[type="submit"]');

  // ユーザー名入力
  await page.fill('input[name="username"]', process.env.USERNAME!);

  // パスワード入力
  await page.fill('input[name="password"]', process.env.PASSWORD!);

  // 3. ログイン後ページを待つ
  await page.waitForLoadState('networkidle');

  // 4. storage フォルダ作成
  const storageDir = path.resolve(__dirname, '../../storage');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  // 5. 認証情報を書き出す
  const storagePath = path.join(storageDir, 'auth.json');
  await page.context().storageState({ path: storagePath });

  console.log(`✅ storageState saved at ${storagePath}`);
});

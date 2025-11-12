import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({
    headless: false,  // ブラウザ表示
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // IAPにリダイレクトされる
  await page.goto('https://dev.d5q9i5ebfuc1x.amplifyapp.com/', { waitUntil: 'domcontentloaded' });

  // ログインボタンをクリック
  await page.getByRole('button', { name: 'ログイン' }).click();

  // :下向き指差し: ここで Playwright Inspector が開く
  // 手動で Google アカウント選択 → SAML通過
  // SaaS のログイン画面が表示されたら Enter キーで続行
  await page.pause();

  // ここで状態を保存
  await context.storageState({ path: 'storage/auth.json' });

  console.log(':チェックマーク_緑: SaaSのログイン画面までの状態を auth.json に保存しました');
  await browser.close();
})();
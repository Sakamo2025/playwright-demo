import { defineConfig } from '@playwright/test';
console.log(":めくったページ: config 読み込まれたよ！");
export default defineConfig({
  testDir: 'tests',  // テストファイルが存在するディレクトリ
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  timeout: 30000,    // テストのタイムアウト（ミリ秒）
  use: {
    baseURL: 'https://dev.d1x2fefh4glbva.amplifyapp.com/auth/sign-in',
    storageState: 'storage/auth.json',
    headless: false, // ヘッドレスモード（trueにするとブラウザが表示されない）
    screenshot: 'only-on-failure',  // 失敗した場合のみスクリーンショットを撮る
    video: 'on',     // テスト実行中の動画を記録
  },
});
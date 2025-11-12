// @ts-nocheck
const { test, expect } = require('@playwright/test');
const path = require('path');

test.use({ storageState: 'storage/auth.json' });

test('グループ一覧から各項目編集、施設設定', async ({ page }) => {  
  test.setTimeout(60000);

  await page.goto('https://dev.d5q9i5ebfuc1x.amplifyapp.com/');

  await page.getByRole('link', { name: '施設一覧' }).first().click();

  // 関西パビリオン用施設のレコードをクリック
  await page.locator('tr', { hasText: '関西パビリオン用施設' }).click();
  await page.waitForTimeout(1000);



});
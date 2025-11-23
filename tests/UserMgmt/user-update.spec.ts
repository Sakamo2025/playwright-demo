import { test, expect } from '@playwright/test'

test('ユーザー一覧から任意の行を開いてLLM/プロンプト/所属施設/サブスク設定などを操作', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto('https://stg.d5q9i5ebfuc1x.amplifyapp.com/');

  // 「mac01」を含む行を探してクリック
  await page.locator('tr', { hasText: 'mac01' }).click();

  // === LLM の種類を変更 ===
  await page.getByRole('combobox').nth(0).click();
  const llmOptions = page.getByRole('option');
  const llmCount = await llmOptions.count();
  const randomLlmIndex = Math.floor(Math.random() * llmCount);
  await llmOptions.nth(randomLlmIndex).click();

  // === プロンプトの種類を変更 ===
  await page.getByRole('combobox').nth(1).click();
  const promptOptions = page.getByRole('option');
  const promptCount = await promptOptions.count();
  const randomPromptIndex = Math.floor(Math.random() * promptCount);
  await promptOptions.nth(randomPromptIndex).click();

  // :white_check_mark: 更新ボタンをクリック（LLM/プロンプト設定）
  await page.getByRole('button', { name: '更新' }).nth(0).click();
  await page.waitForTimeout(3000);

  // === 所属施設の変更 ===
  await page.getByRole('combobox').nth(2).click();
  const facilityOptions = page.getByRole('option');
  const facilityCount = await facilityOptions.count();
  const randomFacilityIndex = Math.floor(Math.random() * facilityCount);
  await facilityOptions.nth(randomFacilityIndex).click();

  // :white_check_mark: 更新ボタンをクリック（施設設定）
  await page.getByRole('button', { name: '更新' }).nth(1).click();
  await page.waitForTimeout(3000);

  // === サブスクリプション設定 ===
  await page.getByRole('button', { name: 'サブスクリプションを作成する' }).click();
  await page.getByRole('button', { name: 'プランを選択' }).click();
  await page.getByText('poepoe').first().click();

  await page.getByRole('textbox', { name: '開始日' }).fill('2025-07-01');
  await page.getByRole('textbox', { name: '終了日' }).fill('2026-09-30');
  await page.getByRole('button', { name: '登録' }).click();

  await page.waitForTimeout(3000);
});
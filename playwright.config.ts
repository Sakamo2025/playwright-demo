/* eslint-disable @typescript-eslint/no-var-requires */

import { defineConfig } from '@playwright/test';
import path from 'path';

export default defineConfig({
  use: {
    storageState: path.resolve(__dirname, 'storage/auth.json'),
  },
});

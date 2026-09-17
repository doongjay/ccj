import { defineConfig } from '../../../game/node_modules/@playwright/test/index.mjs';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
process.env.REVIEW_EVIDENCE = resolve(__dirname);
mkdirSync(resolve(__dirname, 'regressions'), { recursive: true });
export default defineConfig({
  testDir: '../../../game/e2e',
  testMatch: ['post-boot-loading.spec.ts', 'invitation-photo-loading.spec.ts', 'review-batch-b-access.spec.ts'],
  grep: /slow post-boot|direct invitation|game boot|photo failure|display variants|F08: lobby/,
  workers: 2, timeout: 60000,
  reporter: [['list'], ['json', { outputFile: './local-01.json' }]],
  outputDir: './runs/local-01',
  use: { baseURL: 'http://127.0.0.1:5174', viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, video: 'on', trace: 'retain-on-failure' },
});

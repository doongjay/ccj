import { defineConfig } from '../../../game/node_modules/@playwright/test/index.mjs';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
process.env.REVIEW_EVIDENCE = resolve(__dirname);
mkdirSync(resolve(__dirname, 'regressions'), { recursive: true });
export default defineConfig({
  testDir: '../../../game/e2e', testMatch: 'review-batch-b-performance.spec.ts', workers: 1,
  reporter: [['list'], ['json', { outputFile: './production-01.json' }]], outputDir: './runs/production-01',
  use: { baseURL: 'http://127.0.0.1:5199', viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, video: 'on', trace: 'retain-on-failure' },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 5199 --strictPort', cwd: resolve(__dirname, '../../../game'), url: 'http://127.0.0.1:5199', reuseExistingServer: false },
});

import { defineConfig } from '../../../game/node_modules/@playwright/test/index.mjs';

export default defineConfig({
  testDir: '../../../game/e2e',
  testMatch: 'invitation-photo-loading.spec.ts',
  grep: /direct invitation reveals/,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: './regression.json' }]],
  outputDir: './regression',
  use: { baseURL: 'http://127.0.0.1:5174', trace: 'retain-on-failure' },
});

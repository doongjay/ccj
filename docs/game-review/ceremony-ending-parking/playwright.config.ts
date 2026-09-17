import { defineConfig } from '../../../game/node_modules/@playwright/test/index.mjs';
export default defineConfig({
  testDir: '../../../game/e2e',
  testMatch: ['ceremony-ending-parking.spec.ts', 'cloud-photos.spec.ts', 'group-screen-reuse.spec.ts', 'car-guidance-reference.spec.ts', 'invitation-photo-loading.spec.ts', 'post-boot-loading.spec.ts'],
  workers: 2, timeout: 60000,
  reporter: [['list'], ['json', { outputFile: './local-02.json' }]],
  outputDir: './runs/local-02',
  use: { baseURL: 'http://127.0.0.1:5174', viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, hasTouch: true, video: 'on', trace: 'retain-on-failure' },
});

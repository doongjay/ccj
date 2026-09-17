import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { installPlayerObservation } from "./corridor-observables";
import { startPreparedScene } from "./stage-fixtures";
import { chooseStory } from "./story-helpers";

const viewports = [{ width: 320, height: 568 }, { width: 393, height: 852 }, { width: 430, height: 932 }];
test.beforeEach(async ({ page }) => {
  // These checks never submit a guestbook entry or contact the real backend.
  await page.route('**/rest/v1/**', route => route.fulfill({ json: [] }));
  await installPlayerObservation(page);
});

for (const viewport of viewports) test(`hall typing stays put and photograph matches the viewfinder at ${viewport.width}`, async ({ page }, info) => {
  await page.setViewportSize(viewport);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', entry => { if (entry.type() === 'error') errors.push(entry.text()); });
  await page.goto('/');
  const canvas = page.locator('#app canvas');
  await expect(canvas).toHaveAttribute('data-active-scene', 'IntroScene');
  await page.evaluate(() => {
    const samples: { copy: string; maxShift: number }[] = [];
    Object.assign(window, { hallTyping: samples });
    new MutationObserver(() => {
      const panel = document.querySelector('.story-narration[aria-label^="시어터가"]');
      const copy = panel?.querySelector('.story-copy'), reserve = panel?.querySelector('.story-reserve');
      if (!copy?.firstChild || !reserve?.firstChild) return;
      let maxShift = 0;
      for (let i = 0; i < copy.textContent!.length; i++) {
        if (/\s/.test(copy.textContent![i]!)) continue;
        const a = document.createRange(), b = document.createRange();
        a.setStart(copy.firstChild, i); a.setEnd(copy.firstChild, i + 1);
        b.setStart(reserve.firstChild, i); b.setEnd(reserve.firstChild, i + 1);
        const current = a.getBoundingClientRect(), final = b.getBoundingClientRect();
        maxShift = Math.max(maxShift, Math.abs(current.x - final.x), Math.abs(current.y - final.y));
      }
      samples.push({ copy: copy.textContent!, maxShift });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  });
  await startPreparedScene(page, 'VenueHallScene');
  await expect(page.locator('.story-copy')).toHaveText('시어터가 진짜 영화관만한\n스크린이 있어서 시어터였구나.');
  await page.screenshot({ path: info.outputPath(`hall-copy-${viewport.width}.png`) });
  const samples = await page.evaluate(() => (window as unknown as { hallTyping: { copy: string; maxShift: number }[] }).hallTyping);
  expect(samples.length).toBeGreaterThan(10);
  expect(Math.max(...samples.map(sample => sample.maxShift))).toBeLessThanOrEqual(.5);
  await page.getByRole('button', { name: '박수를 친다', exact: true }).click();
  await expect(canvas).toHaveAttribute('data-ceremony-stage', 'group-photo');
  await page.screenshot({ path: info.outputPath(`viewfinder-${viewport.width}.png`) });
  await chooseStory(page, '사진 찍기');
  const photo = page.locator('.keepsake-group canvas');
  await expect(photo).toBeVisible({ timeout: 10000 });
  const comparison = await page.evaluate(async () => {
    const game = window.__venueQaGame as Phaser.Game;
    const scene = game.scene.getScene('VenueHallScene');
    const cameraUi = scene.children.getByName('group-photo-camera-ui') as Phaser.GameObjects.Container;
    const visible = cameraUi.visible;
    cameraUi.setVisible(false);
    const image = await new Promise<HTMLImageElement>(resolve => game.renderer.snapshot(image => resolve(image as HTMLImageElement)));
    cameraUi.setVisible(visible);
    const expected = document.createElement('canvas'); expected.width = 640; expected.height = 485;
    const context = expected.getContext('2d')!;
    context.drawImage(image, 40, 510, 640, 485, 0, 0, 640, 485);
    const actual = document.querySelector<HTMLCanvasElement>('.keepsake-group canvas')!;
    const pixels = actual.getContext('2d')!.getImageData(0, 0, actual.width, actual.height).data;
    const reference = context.getImageData(0, 0, 640, 485).data;
    let different = 0;
    for (let i = 0; i < pixels.length; i++) if (pixels[i] !== reference[i]) different++;
    return { width: actual.width, height: actual.height, different, cameraUiRestored: visible };
  });
  expect(comparison).toEqual({ width: 640, height: 485, different: 0, cameraUiRestored: true });
  await page.waitForTimeout(5500);
  await expect(photo).toBeVisible();
  await page.screenshot({ path: info.outputPath(`photo-result-${viewport.width}.png`) });
  await page.getByRole('button', { name: '다음으로', exact: true }).click();
  await expect(canvas).toHaveAttribute('data-active-scene', 'DinnerJourneyScene');
  expect(errors).toEqual([]);
  await info.attach('typing-and-crop', { body: JSON.stringify({ viewport, samples, comparison, errors }), contentType: 'application/json' });
});

for (const viewport of viewports) test(`ending skip, opening branding and public disclosure at ${viewport.width}`, async ({ page }, info) => {
  await page.setViewportSize(viewport);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', entry => { if (entry.type() === 'error') errors.push(entry.text()); });
  // Exercise the real production presentation branch with a local-only fake client.
  await page.route('**/src/cloud/client.ts', async route => {
    const response = await route.fetch();
    const body = await response.text();
    expect(body).toContain('import.meta.env.VITE_SUPABASE_URL');
    await route.fulfill({ response, body: body.replaceAll('import.meta.env.VITE_SUPABASE_URL', '"http://127.0.0.1:54321"').replaceAll('import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY', '"test-key"') });
  });
  await page.goto('/');
  await expect(page.locator('#app canvas')).toHaveAttribute('data-active-scene', 'IntroScene');
  const opening = await page.evaluate(() => (window.__venueQaGame as Phaser.Game).scene.getScene('IntroScene').children.list.filter(child => child.getData('screenBranding')).map(child => {
    const item = child as Phaser.GameObjects.Text;
    return { text: child.getData('screenBrandingCopy'), x: item.x, y: item.y };
  }));
  await page.evaluate(async () => {
    const path = '/src/state/gameState.ts';
    const { GAME_STATE_REGISTRY_KEYS } = await import(path) as typeof import('../src/state/gameState');
    (window.__venueQaGame as Phaser.Game).registry.set(GAME_STATE_REGISTRY_KEYS.guestName, '테스트하객');
  });
  await startPreparedScene(page, 'EndingScene');
  const detail = page.locator('.text-entry-note-detail');
  await expect(detail).toHaveText('이름, 미니미와 메시지는 방명록에 공개됩니다.');
  const geometry = await detail.evaluate(node => {
    const heading = document.querySelector('.text-entry-note-heading')!;
    const a = node.getBoundingClientRect(), b = heading.getBoundingClientRect();
    const range = document.createRange(); range.selectNodeContents(node);
    const text = range.getBoundingClientRect();
    return { singleLine: range.getClientRects().length === 1, fits: text.right <= a.right + .5, below: a.top > b.bottom, detailFont: parseFloat(getComputedStyle(node).fontSize), headingFont: parseFloat(getComputedStyle(heading).fontSize) };
  });
  expect(geometry.singleLine && geometry.fits && geometry.below).toBe(true);
  expect(geometry.detailFont).toBeLessThan(geometry.headingFont);
  const skip = page.getByRole('button', { name: '나중에 남기기', exact: true });
  await expect(skip).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(skip).toHaveCSS('border-top-width', '0px');
  expect((await skip.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await page.screenshot({ path: info.outputPath(`ending-form-${viewport.width}.png`) });
  await skip.tap();
  await page.locator('.story-narration').click();
  await page.waitForTimeout(700);
  const ending = await page.evaluate(() => (window.__venueQaGame as Phaser.Game).scene.getScene('EndingScene').children.list.filter(child => child.getData('screenBranding')).map(child => {
    const item = child as Phaser.GameObjects.Text;
    return { text: child.getData('screenBrandingCopy'), x: item.x, y: item.y };
  }));
  expect(ending).toEqual(opening);
  await page.screenshot({ path: info.outputPath(`ending-thanks-${viewport.width}.png`) });
  expect(errors).toEqual([]);
  await info.attach('ending-presentation', { body: JSON.stringify({ viewport, geometry, opening, ending, errors }), contentType: 'application/json' });
});

for (const viewport of viewports) test(`invitation header, details and anchored particle density at ${viewport.width}`, async ({ page }, info) => {
  await page.setViewportSize(viewport);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', entry => { if (entry.type() === 'error') errors.push(entry.text()); });
  await page.goto('/');
  await expect(page.locator('#app canvas')).toHaveAttribute('data-active-scene', 'IntroScene');
  await startPreparedScene(page, 'HomeSelectScene');
  await page.getByRole('button', { name: '청첩장', exact: true }).click();
  const root = page.locator('.invitation-page');
  await expect(root).toHaveAttribute('data-photos-state', 'ready', { timeout: 20000 });
  const back = page.getByRole('button', { name: '게임으로', exact: true });
  await expect(back).toBeVisible();
  expect(await root.evaluate(node => node.scrollWidth)).toBe(viewport.width);
  for (const button of await page.locator('.invitation-nav button').all()) {
    const bounds = (await button.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
    expect(bounds.height).toBeGreaterThanOrEqual(44);
  }
  await page.screenshot({ path: info.outputPath(`invitation-header-${viewport.width}.png`) });
  await page.locator('.wedding-ambience-band span').evaluateAll(nodes => nodes.forEach(node => (node as HTMLElement).style.animationPlayState = 'paused'));
  const first = page.locator('.wedding-ambience-band span').first();
  const before = (await first.boundingBox())!;
  await root.evaluate(node => { node.scrollTop = 220; });
  const after = (await first.boundingBox())!;
  expect(before.y - after.y).toBeCloseTo(220, 0);
  const density = await root.evaluate(node => {
    const visible = () => [...node.querySelectorAll('.wedding-ambience-band span')].filter(item => { const b = item.getBoundingClientRect(); return b.bottom > 0 && b.top < innerHeight; }).length;
    const counts = [];
    for (const top of [0, node.clientHeight * 3, node.clientHeight * 6]) { node.scrollTop = top; counts.push(visible()); }
    return counts;
  });
  expect(density.every(count => count >= 10 && count <= 14)).toBe(true);
  const date = page.locator('.invitation-date-section');
  await date.locator('h2').evaluate(node => node.scrollIntoView({ block: 'center' }));
  await expect(date.locator('h2')).toHaveText('2026년 11월 21일 (토)');
  await expect(date.locator('.invitation-lead')).toHaveText('오후 2시 라시따시어터');
  await page.screenshot({ path: info.outputPath(`invitation-date-${viewport.width}.png`) });
  await page.getByRole('button', { name: '예식 안내', exact: true }).click();
  await expect(page.getByText('서울 서초구 양재동 215 (매헌로 16)', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: '카카오맵', exact: true })).toHaveAttribute('href', `https://map.kakao.com/link/search/${encodeURIComponent('라시따시어터')}`);
  await page.screenshot({ path: info.outputPath(`invitation-location-${viewport.width}.png`) });
  await back.click();
  await expect(page.getByRole('textbox', { name: '내 이름은', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
  await info.attach('invitation-layout', { body: JSON.stringify({ viewport, density, errors }), contentType: 'application/json' });
});

test('pink route parks inside the tower bay before the shutter closes', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', entry => { if (entry.type() === 'error') errors.push(entry.text()); });
  await page.goto('/');
  const canvas = page.locator('#app canvas');
  await expect(canvas).toHaveAttribute('data-active-scene', 'IntroScene');
  await startPreparedScene(page, 'CarRouteScene');
  await chooseStory(page, '분홍색');
  await expect(canvas).toHaveAttribute('data-parking-map', 'tower', { timeout: 15000 });
  await page.screenshot({ path: info.outputPath('tower-arrival.png') });
  await expect(canvas).toHaveAttribute('data-tower-parking-phase', 'entering', { timeout: 6000 });
  await page.screenshot({ path: info.outputPath('tower-entering.png') });
  await expect(canvas).toHaveAttribute('data-tower-parking-phase', 'closing');
  expect(await page.evaluate(() => window.__venuePlayerSnapshot())).toMatchObject({ x: 360, y: 760, moving: false });
  await expect(canvas).toHaveAttribute('data-tower-parking-phase', 'stored');
  await page.screenshot({ path: info.outputPath('tower-stored.png') });
  await expect(canvas).toHaveAttribute('data-lobby-ready', 'true', { timeout: 10000 });
  expect(errors).toEqual([]);
});

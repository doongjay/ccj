import { chromium } from '../../../game/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const output = fileURLToPath(new URL('.', import.meta.url));
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const viewport of [{ width: 320, height: 568 }, { width: 393, height: 852 }, { width: 430, height: 932 }]) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
      ...(viewport.width === 393 ? { recordVideo: { dir: join(output, 'video'), size: viewport } } : {}) });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
    await page.goto('http://127.0.0.1:5174/#invitation');
    await page.locator('.invitation-page[data-photos-state="ready"]').waitFor({ timeout: 30000 });
    await page.screenshot({ path: join(output, `top-${viewport.width}.png`) });
    const particle = page.locator('.invitation-paper > .wedding-ambience span').first();
    // Observe the actual CSS animation, then freeze only while measuring scroll attachment.
    await particle.evaluate(node => node.scrollIntoView({ block: 'center' }));
    const movingStart = await particle.boundingBox();
    await page.waitForTimeout(1800);
    const movingEnd = await particle.boundingBox();
    await page.screenshot({ path: join(output, `floating-${viewport.width}.png`) });
    await particle.evaluate(node => node.getAnimations().forEach(animation => animation.pause()));
    const before = await particle.evaluate(node => ({ y: node.getBoundingClientRect().y, scroll: document.querySelector('.invitation-page').scrollTop }));
    await page.mouse.move(viewport.width / 2, viewport.height / 2);
    await page.mouse.wheel(0, 280);
    await page.waitForTimeout(500);
    const after = await particle.evaluate(node => ({ y: node.getBoundingClientRect().y, scroll: document.querySelector('.invitation-page').scrollTop }));
    const scrollDelta = after.scroll - before.scroll;
    const attachmentError = Math.abs(after.y - before.y + scrollDelta);
    await particle.evaluate(node => node.getAnimations().forEach(animation => animation.play()));
    await page.screenshot({ path: join(output, `scrolled-${viewport.width}.png`) });
    // Existing navigation and image interaction remain usable through the decoration layer.
    await page.locator('.invitation-nav').getByRole('button', { name: '사진', exact: true }).click();
    await page.getByRole('button', { name: '1번째 사진 크게 보기', exact: true }).click();
    await page.getByRole('dialog').waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'detached' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const reducedAnimation = await particle.evaluate(node => getComputedStyle(node).animationName);
    const state = await page.locator('.invitation-page').evaluate(node => ({
      overflow: node.scrollWidth > node.clientWidth,
      count: node.querySelectorAll('.wedding-ambience span').length,
      pointerEvents: getComputedStyle(node.querySelector('.wedding-ambience')).pointerEvents,
      hiddenFromAccessibility: node.querySelector('.wedding-ambience').getAttribute('aria-hidden'),
    }));
    const result = { viewport, movingStart, movingEnd, before, after, scrollDelta, attachmentError, reducedAnimation, ...state, errors };
    results.push(result);
    await context.close();
    if (scrollDelta < 200 || attachmentError > 1 || Math.abs(movingEnd.y - movingStart.y) < 0.1 || reducedAnimation !== 'none' || state.overflow || state.count !== 12 || state.pointerEvents !== 'none' || state.hiddenFromAccessibility !== 'true' || errors.length) throw new Error(JSON.stringify(result));
  }
} finally {
  await browser.close();
  await writeFile(join(output, 'browser-results.json'), JSON.stringify(results, null, 2));
}
console.log(JSON.stringify(results.map(({ viewport, scrollDelta, attachmentError, errors }) => ({ viewport, scrollDelta, attachmentError, errors })), null, 2));

import { createRequire } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/home/irfansofyana/repos/agent-artifacts/node_modules/playwright');
const site = process.env.RESUME_URL || 'http://127.0.0.1:4175/';
const launch = () => chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome' });

test('explicit Light and Dark choices persist across reload', async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage();
    await page.goto(site);
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await page.evaluate(() => localStorage.setItem('resume-theme', 'dark'));
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    assert.equal(await page.locator('#theme-toggle').getAttribute('aria-pressed'), 'true');
    await page.locator('#theme-toggle').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    assert.equal(await page.evaluate(() => localStorage.getItem('resume-theme')), 'light');
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  } finally { await browser.close(); }
});

test('blocked storage falls back to Light but permits an in-memory toggle', async () => {
  const browser = await launch();
  try {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      Storage.prototype.getItem = () => { throw new Error('storage blocked'); };
      Storage.prototype.setItem = () => { throw new Error('storage blocked'); };
    });
    const page = await context.newPage();
    await page.goto(site);
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await page.locator('#theme-toggle').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  } finally { await browser.close(); }
});

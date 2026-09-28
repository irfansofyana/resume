import { createRequire } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
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

test('Dark uses design-system semantic colors and readable type roles', async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(site);
    await page.locator('#theme-toggle').click();
    await page.waitForTimeout(350); // Existing link color transitions must settle before sampling.
    const styles = await page.evaluate(() => {
      const color = selector => getComputedStyle(document.querySelector(selector)).color;
      return {
        contact: color('.resume-contact-links a'),
        nav: color('.section-navigation a'),
        eyebrow: color('.resume-eyebrow'),
        rule: getComputedStyle(document.querySelector('.section-navigation')).borderTopColor,
        bodyFont: getComputedStyle(document.body).fontFamily,
        headingFont: getComputedStyle(document.querySelector('.header-name')).fontFamily,
      };
    });
    assert.equal(styles.contact, 'rgb(106, 215, 255)', 'Dark contact links should use design-system cyan');
    assert.equal(styles.nav, 'rgb(168, 184, 168)', 'repeated section links should use subdued readable text');
    assert.equal(styles.eyebrow, 'rgb(255, 217, 102)', 'eyebrow should use design-system gold');
    assert.equal(styles.rule, 'rgba(54, 255, 122, 0.25)', 'section divider should use restrained phosphor');
    assert.match(styles.bodyFont, /Fira Code/);
    assert.match(styles.headingFont, /JetBrains Mono/);
  } finally { await browser.close(); }
});

test('blocked storage falls back to Light but permits an in-memory toggle', async () => {
  const browser = await launch();
  try {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get() { throw new Error('storage blocked'); }
      });
    });
    const page = await context.newPage();
    await page.goto(site);
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await page.locator('#theme-toggle').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  } finally { await browser.close(); }
});

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

test('project and certification title links meet text contrast in both themes', async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(site);
    for (const theme of ['light', 'dark']) {
      if (theme === 'dark') {
        await page.locator('#theme-toggle').click();
        await page.waitForTimeout(350); // Let existing link transitions settle.
      }
      const samples = await page.evaluate(() => {
        const rgb = value => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
        const luminance = value => {
          const channels = rgb(value).map(channel => {
            const c = channel / 255;
            return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          });
          return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
        };
        const surface = getComputedStyle(document.querySelector('.wrapper')).backgroundColor;
        return ['#projects .resume-item-title a', '#certifications .resume-item-title a'].map(selector => {
          const element = document.querySelector(selector);
          if (!element) throw new Error(`Missing title link: ${selector}`);
          const foreground = getComputedStyle(element).color;
          const a = luminance(foreground), b = luminance(surface);
          return { selector, foreground, surface, contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) };
        });
      });
      for (const sample of samples) {
        assert.ok(sample.contrast >= 4.5, `${theme}: ${JSON.stringify(sample)}`);
      }
    }
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

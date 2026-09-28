import { createRequire } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const site = process.env.RESUME_URL || 'http://127.0.0.1:4175/';
const launch = () => chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome' });

test('artifact-inspired shell keeps natural mobile document scroll and experience in view', async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(site, { waitUntil: 'networkidle' });
    const view = await page.evaluate(() => ({
      chrome: !!document.querySelector('.terminal-window > .window-chrome'),
      toolbar: !!document.querySelector('.page-inner > .page-header .page-toolbar'),
      pageScroll: document.documentElement.scrollHeight > innerHeight,
      shellOverflow: document.querySelector('.terminal-window') ? getComputedStyle(document.querySelector('.terminal-window')).overflowY : 'missing',
      firstRole: document.querySelector('#experience .resume-position').getBoundingClientRect().top,
    }));
    assert.ok(view.chrome && view.toolbar, JSON.stringify(view));
    assert.ok(view.pageScroll, 'long résumé must use natural page scroll');
    assert.notEqual(view.shellOverflow, 'auto', 'avoid a nested viewport-sized scroller');
    assert.ok(view.firstRole < 844, `first role starts at ${view.firstRole}px`);
  } finally { await browser.close(); }
});

test('experience prose uses a readable measure on desktop like the reference', async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(site);
    const width = await page.locator('#experience .resume-position .resume-item-copy').first().evaluate(el => el.getBoundingClientRect().width);
    assert.ok(width >= 680 && width <= 750, `experience prose is ${width}px wide`);
  } finally { await browser.close(); }
});

test('desktop keeps one centered document column with Profile after Experience', async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(site);
    const panels = await page.evaluate(() => {
      const frame = document.querySelector('.terminal-window').getBoundingClientRect();
      const exp = document.querySelector('#experience').getBoundingClientRect();
      const profile = document.querySelector('#profile').getBoundingClientRect();
      const projects = document.querySelector('#projects').getBoundingClientRect();
      return { frameWidth: frame.width, expLeft: exp.left, expBottom: exp.bottom,
        profileLeft: profile.left, profileTop: profile.top, profileBottom: profile.bottom,
        projectsTop: projects.top, mainDisplay: getComputedStyle(document.querySelector('#main-content')).display };
    });
    assert.ok(panels.frameWidth <= 960, JSON.stringify(panels));
    assert.equal(panels.mainDisplay, 'block');
    assert.ok(Math.abs(panels.profileLeft - panels.expLeft) < 2, JSON.stringify(panels));
    assert.ok(panels.profileTop >= panels.expBottom && panels.projectsTop >= panels.profileBottom, JSON.stringify(panels));
  } finally { await browser.close(); }
});

test('full profile copy is visible after experience so mobile readers reach work first', async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(site);
    assert.ok(await page.locator('#profile').isVisible());
    assert.equal(await page.locator('#profile p').count(), 2);
    assert.equal(await page.locator('#profile p').first().textContent(), 'I build applied AI platforms, backend engineering, developer experience tooling, and infrastructure for Fintech and Banking Companies. Currently, I lead AI and automation platform initiatives at Superbank, helping teams adopt AI safely, automate repeatable workflows, and improve operational execution.');
    assert.equal(await page.locator('#profile p').last().textContent(), 'Before Superbank, I spent four years at Xendit, growing from intern to Senior Software Engineer while building Open Banking APIs, payment infrastructure, and internal automation systems. Outside my day-to-day work, I stay active in open source through developer tooling, AI/LLM infrastructure, and productivity-focused projects. I am open to conversations around applied AI, backend engineering, developer experience, infrastructure, and engineering productivity roles.');
    const order = await page.evaluate(() => ['experience','profile','projects'].map(id => document.getElementById(id).getBoundingClientRect().top));
    assert.ok(order[0] < order[1] && order[1] < order[2], String(order));
    assert.equal(await page.locator('.section-navigation a[href="#profile"]').count(), 1);
  } finally { await browser.close(); }
});

for (const [width, height] of [[320, 700], [390, 844], [767, 900], [768, 1024], [769, 900], [1280, 800]]) {
  test(`résumé remains navigable without document overflow at ${width}×${height}`, async () => {
    const browser = await launch();
    try {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(site, { waitUntil: 'networkidle' });
      const geometry = await page.evaluate(() => ({
        viewport: innerWidth,
        width: document.documentElement.scrollWidth,
        experience: document.querySelector('#experience').getBoundingClientRect().top,
        links: [...document.querySelectorAll('.section-navigation a')].map(a => ({
          name: a.textContent.trim(), target: !!document.querySelector(a.getAttribute('href'))
        })),
        contact: [...document.querySelectorAll('.resume-contact-links a')].map(a => a.textContent.trim()),
        roleCount: document.querySelectorAll('#experience .resume-position').length,
        projectCount: document.querySelectorAll('#projects .project-card').length,
      }));
      assert.ok(geometry.width <= geometry.viewport, JSON.stringify(geometry));
      assert.ok(geometry.links.every(a => a.name && a.target), JSON.stringify(geometry.links));
      assert.ok(geometry.contact.length >= 3 && geometry.contact.every(Boolean));
      assert.ok(geometry.roleCount > 3 && geometry.projectCount > 3);
      if (width === 390) assert.ok(geometry.experience < 844, `Experience starts at ${geometry.experience}px`);
      assert.deepEqual(errors, []);
    } finally { await browser.close(); }
  });
}

test('native section links and résumé content work without JavaScript', async () => {
  const browser = await launch();
  try {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(site);
    assert.ok(await page.locator('#experience .resume-position').count() > 3);
    await page.locator('.section-navigation a[href="#projects"]').click();
    assert.equal(new URL(page.url()).hash, '#projects');
    assert.ok(await page.locator('#projects .project-card').count() > 3);
  } finally { await browser.close(); }
});

test('long linked text stays within a 320px viewport', async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(site);
    await page.locator('#projects .project-card a').first().evaluate(a => { a.textContent = 'long-identifier-'.repeat(20); });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  } finally { await browser.close(); }
});

test('printing from Dark uses a light paper surface and dark text', async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage();
    await page.goto(site);
    await page.locator('#theme-toggle').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await page.emulateMedia({ media: 'print' });
    const colors = await page.evaluate(() => ({
      page: getComputedStyle(document.querySelector('.wrapper')).backgroundColor,
      text: getComputedStyle(document.querySelector('.page-header .header-name')).color,
      layout: getComputedStyle(document.querySelector('#main-content')).display,
      experienceBottom: document.querySelector('#experience').getBoundingClientRect().bottom,
      profileTop: document.querySelector('#profile').getBoundingClientRect().top,
    }));
    assert.equal(colors.page, 'rgb(255, 255, 255)');
    assert.equal(colors.text, 'rgb(20, 32, 20)');
    assert.equal(colors.layout, 'block');
    assert.ok(colors.profileTop >= colors.experienceBottom);
  } finally { await browser.close(); }
});

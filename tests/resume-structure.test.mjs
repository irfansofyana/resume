import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../_layouts/resume.html', import.meta.url), 'utf8');

test('header offers a named theme control', () => {
  assert.match(source, /id="theme-toggle"/);
});

test('experience follows a compact header without the redundant action panel', () => {
  assert.ok(source.indexOf('id="experience"') > source.indexOf('class="page-header"'));
  assert.doesNotMatch(source, /class="header-action-panel/);
});

test('contact and section navigation are text-visible above experience', () => {
  const header = source.slice(0, source.indexOf('id="experience"'));
  assert.match(header, /class="resume-contact-links"/);
  assert.match(header, /href="mailto:{{ site\.resume_contact_email }}"/);
  assert.match(header, /class="section-navigation(?:\s[^"]*)?"/);
  assert.match(header, /href="#experience"/);
  assert.doesNotMatch(header, /class="focus-strip"|include icon-links\.html/);
  assert.ok(header.indexOf('resume-contact-links') < header.indexOf('section-navigation'));
});

test('all public résumé sections retain their anchors', () => {
  const html = readFileSync(`${process.env.TMPDIR}/resume-jekyll/site/index.html`, 'utf8');
  for (const id of ['experience', 'education', 'skills', 'projects', 'certifications', 'recognition', 'publications', 'links']) {
    assert.ok(html.includes(`id="${id}"`), `missing #${id}`);
  }
});

test('public résumé detail remains sourced from existing Jekyll data', () => {
  assert.match(source, /site\.data\.experience/);
  assert.match(source, /position\.summary/);
  assert.match(source, /site\.data\.projects/);
  assert.match(source, /project\.description/);
});

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

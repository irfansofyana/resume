# Human-Readable Live Résumé Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing Jekyll résumé into a compact, experience-first document with accessible, persistent Light and Dark modes and a real local preview before any publication.

**Architecture:** Keep Jekyll, existing `_data/*.yml`, and the current URL. Simplify the Liquid header/navigation and reorder existing sections without inventing achievements. Add a focused theme stylesheet and small theme script; use the supplied design-system ZIP for color/font decisions while keeping the page a résumé rather than copying the artifact-site shell. Build with the repo's pinned gems in an isolated Docker container if Ruby is unavailable on the host.

**Tech Stack:** Jekyll / GitHub Pages, Liquid, Sass, vanilla JavaScript, Node built-in test runner, browser automation for rendered acceptance, Docker for local Jekyll if necessary.

**Spec:** `docs/superpowers/specs/2026-09-28-human-readable-live-resume-design.md`

## Global Constraints

- Work locally in `/home/irfansofyana/repos/resume`; do not push or publish without Irfan's approval of actual rendered screenshots.
- Preserve Jekyll content sources, current URL, existing source-backed claims and anchor destinations. Never add private-company details, internal metrics or invented achievements.
- Show both Light and Dark with a visible labeled button. Default Light, persist explicit choice, prevent wrong-mode first paint, fall back to Light when storage fails, and print in Light.
- Experience must start within a normal 390 × 844 phone viewport. Keep contact links text-visible and maintain keyboard, no-JS content access, print and responsive readability.
- Use the supplied `Irfan Devs Design System.zip` and prefer checked-in font assets over remote font dependencies where licensing permits.

## Review Focus

1. A localStorage exception (privacy mode) must leave Light readable and the theme button usable in-memory — cover in Task 3 browser test.
2. A saved Dark preference must be applied before visible first paint, including reload — cover in Task 3 browser test.
3. A long URL or skill string at 320px must not expand the whole page — cover in Task 4 browser test.
4. Every existing section anchor must remain reachable after reordering, including with JavaScript off — cover in Task 2 and Task 4 tests.
5. Printing after choosing Dark must still show light paper and readable text — cover in Task 4 print-media browser check.

---

### Task 1: Reproducible Jekyll build and baseline checks

**Files:** Create `tests/resume-structure.test.mjs`, `scripts/build-local.sh` only if Docker is needed; leave existing `Gemfile.lock` pinned.

**Interfaces:** Inputs are tracked Jekyll source; output is `_site/index.html` and compiled CSS for subsequent tests. Node tests read source/generated content but do not rewrite source.

- [ ] **Step 1: Write failing structural expectations** in `tests/resume-structure.test.mjs` using `node:test` and `node:assert/strict`:
  ```js
  import { readFileSync } from 'node:fs';
  import { test } from 'node:test';
  import assert from 'node:assert/strict';
  const source = readFileSync('_layouts/resume.html', 'utf8');
  test('header offers a named theme control', () => assert.match(source, /id="theme-toggle"/));
  test('experience follows a compact header and inline nav', () => {
    assert.ok(source.indexOf('id="experience"') > source.indexOf('class="page-header"'));
    assert.doesNotMatch(source, /class="header-action-panel/);
  });
  ```
- [ ] **Step 2: Run `node --test tests/resume-structure.test.mjs` and observe the expected failure** for the missing theme control and old header panel. Do not change layout yet.
- [ ] **Step 3: Establish the build baseline** with `docker info` (verified Docker daemon is available), then run the repo Dockerfile and pinned gems:
  ```bash
  docker build -t resume-local .
  docker run --rm -v "$PWD:/home/app" -w /home/app resume-local bundle exec jekyll build
  ```
  If Ruby 2.7 cannot resolve the lockfile, report the exact error and use a compatible official Ruby container with the same pinned gems; never substitute `_site`'s already tracked HTML as a new build.
- [ ] **Step 4: Verify the built `_site/index.html` and CSS exist**, record the exact build command in the plan execution notes; check `git status --short` so generated output does not silently pollute the commit. Commit the focused test/build helper separately if applicable.

### Task 2: Compact experience-first document

**Files:** Modify `_layouts/resume.html`, `_config.yml`, `_sass/_resume.scss`, `_sass/_toc.scss`, `_includes/head.html`; extend `tests/resume-structure.test.mjs`.

**Interfaces:** Jekyll Liquid consumes `site.resume_*` and `_data/*` as before; generated HTML exposes `#experience`, `#projects`, `#skills`, `#education` and all other current anchors. Theme button `#theme-toggle` is wired by Task 3.

- [ ] **Step 1: Extend tests before editing markup.** Parse the generated HTML using browser DOM in Task 4; for source-level regressions, assert `class="resume-contact-links"`, `class="section-navigation"`, `href="#experience"`, `href="mailto:{{ site.resume_contact_email }}"`, and that no focus-strip or icon-only contact replaces text. Check all current section IDs from the existing layout remain in the new layout. Run `node --test tests/resume-structure.test.mjs` and confirm failure for the new structure.
- [ ] **Step 2: Replace only the above-fold header** with utility strip, name, job title, a single short public-source-backed introduction, direct email/LinkedIn/GitHub links and theme button; remove duplicate header-contact line, two-paragraph intro and focus strip. Keep the existing `_data/experience.yml` roles and achievements intact. Example shape:
  ```liquid
  <header class="page-header">
    <div class="resume-utility"><span>Résumé</span><button id="theme-toggle" type="button" aria-pressed="false">Dark mode</button></div>
    <h1 class="header-name" itemprop="name">{{ site.resume_name }}</h1>
    <p class="header-title" itemprop="jobTitle">{{ site.resume_title }}</p>
    <p class="executive-summary" itemprop="description">{{ site.resume_header_intro }}</p>
    <div class="resume-contact-links"><a href="mailto:{{ site.resume_contact_email }}">Email</a><a href="{{ site.resume_social_links.resume_linkedin_url }}">LinkedIn</a><a href="{{ site.resume_social_links.resume_github_url }}">GitHub</a></div>
  </header>
  ```
  Use actual well-formed Liquid and preserve the person's metadata; do not blindly paste the sketch's illustrative copy.
- [ ] **Step 3: Replace fixed floating TOC** with semantic in-flow section navigation after the header. Remove or adapt `assets/js/toc.js` event interception so normal anchors work without JS; retain scroll-spy only if it does not mask native navigation. Reorder existing sections so projects and skills follow experience; do not delete education/certifications/recognition/publications/links. Add skip link and `<main>` landmark with balanced closing tag.
- [ ] **Step 4: Apply design-system typography, spacing, ink and rule patterns** to the existing Sass, reduce header height and allow long content to wrap. Only claim a Last Updated date if its content review was actually done; otherwise remove the stale timestamp. Keep print and metadata accurate.
- [ ] **Step 5: Rebuild, run `node --test tests/resume-structure.test.mjs`, inspect `git diff --check`, and commit this content/layout slice.**

### Task 3: First-class persistent Light and Dark

**Files:** Create `assets/js/theme.js` and `_sass/_theme.scss` (import after existing Sass in `css/main.scss`); modify `_includes/head.html`, `_layouts/resume.html`; extend `tests/resume-structure.test.mjs` and create `tests/theme.browser.mjs` if a local Playwright runtime exists.

**Interfaces:** `<html data-theme="light|dark">`; `#theme-toggle` has `aria-pressed`, text label and button semantics. CSS uses theme variables for body, sheet, headings, links, borders, controls and section details. `localStorage['resume-theme']` stores only `light` or `dark`.

- [ ] **Step 1: Write failing tests** asserting head bootstrap precedes stylesheet, `assets/js/theme.js` is loaded, theme button is labeled and stylesheet defines both `[data-theme="light"]` and `[data-theme="dark"]`. Browser tests must open with `resume-theme=dark`, reload, and check `document.documentElement.dataset.theme === 'dark'`, then click twice and check `aria-pressed` plus saved value. Run and observe the expected failures.
- [ ] **Step 2: Add an inline, exception-safe pre-paint bootstrap** before the CSS link:
  ```html
  <script>try{document.documentElement.dataset.theme=localStorage.getItem('resume-theme')==='dark'?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}</script>
  ```
  A missing, malformed or inaccessible setting resolves to Light.
- [ ] **Step 3: Wire the button on DOMContentLoaded**: read the already-applied root state, toggle between Light/Dark, update `aria-pressed` and text (for example, 'Switch to light mode'), and write localStorage in `try/catch`. A storage error must not block a visual toggle.
- [ ] **Step 4: Scope palette variables to root theme states** and replace hard-coded colors in `_base.scss`, `_resume.scss`, `_toc.scss` where visible in Dark. Add print overrides to force Light colors, not just background. Use the supplied design-system palette and verify focus indicators and links in both modes.
- [ ] **Step 5: Rebuild and run tests**, then exercise Dark → reload → Light → reload, disabled storage, no-JS content, and print media in the browser. Commit this self-contained theme slice.

### Task 4: Browser acceptance, copy/privacy review and local preview

**Files:** Create `tests/resume.browser.mjs` (or use Hermes browser tools if local Playwright cannot run); update `README.md` only for the tested local build/preview command. Do not check screenshots into the public repo before privacy review.

**Interfaces:** Built `_site/` served locally; screenshots under `~/.hermes/cache/scratch/resume-preview/` are review artifacts, not public output.

- [ ] **Step 1: Add browser assertions** for each viewport 320×700, 390×844, 768×1024, 1280×800: `document.documentElement.scrollWidth <= innerWidth`, all nav targets exist, links have text, and `#experience` begins within 844px at 390px. Re-run at 767 and 769 to catch breakpoint issues. For no-JS, assert anchor navigation and résumé text remain available; for storage failure, inject a throwing localStorage getter and assert Light plus functioning toggle.
- [ ] **Step 2: Run the browser test RED if a behavior remains unimplemented**, then fix that behavior with a small focused change and rerun GREEN; do not weaken the check just to make the page pass. Check mobile long URLs and the printed Dark state.
- [ ] **Step 3: Manually inspect all generated public text, `_config.yml`, `_data`, linked assets and screenshots for internal/company-sensitive information, private-person data, private paths, credentials and unsupported claims. Record concerns without publishing the sensitive value. Ask Irfan before changing a substantive claim that could alter his résumé.
- [ ] **Step 4: Capture screenshots of real Jekyll output** at desktop and mobile in both Light and Dark, inspect all four visually and verify no browser console errors, broken images, clipping or inaccessible contrast. Update README with the exact tested local preview command, then run full Node tests, Jekyll build, browser checks and `git diff --check`.
- [ ] **Step 5: Deliver the local screenshots and test results to Irfan.** No push/Pages deployment; ask for approval of the actual site before publication.

## Self-review checkpoints

- Match every assertion to a change that would make it fail. Verify anchor IDs and all section data remain rendered.
- Ensure `#theme-toggle` bootstrap cannot overwrite Light after CSS loads, and root theme/palette selectors match exactly.
- Avoid assuming Docker build or ruby dependency installation succeeds; record actual runtime output before claiming verification.
- Do not mark production complete based on throwaway `previews/compact.html` screenshots.

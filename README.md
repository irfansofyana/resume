# Irfan Sofyana Putra — live résumé

This repository builds the human-readable résumé at [resume.irfansp.dev](https://resume.irfansp.dev/) with Jekyll and GitHub Pages. Experience, projects, skills, education and other sections are sourced from `_data/`; the compact page layout is `_layouts/resume.html`. Light and Dark modes use Irfan's Dev Design System colors and persist a visitor's choice in their browser. Print always uses a light surface.

## Local preview

Ruby/Bundler are not required on the host if Docker is available:

```bash
bash scripts/build-local.sh
python3 -m http.server 4175 --bind 127.0.0.1 --directory "$TMPDIR/resume-jekyll/site"
```

Open <http://127.0.0.1:4175/>. `build-local.sh` builds the pinned GitHub Pages gem image once, mounts this repository read-only, and writes the generated preview to the Hermes scratch directory. After editing the site, rerun the build command and refresh the page. The tracked `_site/` and `.sass-cache/` directories are legacy build output; **do not use them as proof that a new build passed**.

With a local Ruby/Bundler environment, `bundle install && bundle exec jekyll serve` remains an option.

## Editing the résumé

- `_config.yml`: name, current title, concise introduction, contact, and section visibility.
- `_data/experience.yml`, `_data/projects.yml`, `_data/skills.yml` and the other `_data/*.yml`: substantive career details. Keep dates, metrics, and claims accurate and reviewable.
- `_layouts/resume.html`: semantic page structure. `_sass/_readable.scss` and `_sass/_theme.scss`: layout and palettes. `assets/js/theme.js`: the optional mode switch.
- The current theme is Light on first visit; the visible button switches to Dark and back. Navigation and content work without JavaScript.

Run source tests with `node --test tests/resume-structure.test.mjs`. Browser tests require Playwright and Chrome; install Playwright as a development dependency in your preferred environment, or point `PLAYWRIGHT_MODULE` to an existing Playwright installation:

```bash
PLAYWRIGHT_MODULE=/absolute/path/to/node_modules/playwright \
  node --test tests/theme.browser.mjs tests/resume.browser.mjs
```

The browser tests use `http://127.0.0.1:4175/` by default (`RESUME_URL` overrides it). `CHROME_PATH` overrides `/usr/bin/google-chrome`.

## Public release boundary

Before publishing, review configuration, YAML content, generated HTML, metadata, URLs, images, font assets and screenshots. Do not add credentials, private files or paths, another person's private information, confidential company details or unapproved internal metrics. Existing public content is not automatically cleared for a new release. Obtain Irfan's approval of the actual local screenshots before pushing or deploying.

The bundled JetBrains Mono and Fira Code font subsets are licensed under the SIL Open Font License 1.1; their notices are in `assets/fonts/`.

The site's template originated from [jglovier/resume-template](https://github.com/jglovier/resume-template); code/styles retain the repository's [MIT license](LICENSE). The résumé content and portrait are Irfan's, not template demo material.

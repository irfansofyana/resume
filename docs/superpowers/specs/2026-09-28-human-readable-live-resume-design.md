# Human-readable live résumé — design

## Intent and scope

The résumé at `resume.irfansp.dev` should let a human reader identify Irfan's current role, relevant experience, proof of work, and contact paths quickly. Primary readers are prospective collaborators and hiring managers; technical readers can continue into projects and detailed skills. This is a Jekyll site, not a new application. The design direction approved in conversation is **compact and experience-first**, based on the local compact sketch; it is a visual target, not production markup or approved new factual claims.

This change is **local for preview and review**. Do not push, publish, or change the live site until Irfan explicitly approves the implemented local preview. Keep the current site URL, Jekyll data source, links, and existing content unless a specific claim is removed or rewritten for clarity. Preserve print readability.

## Reading hierarchy

1. A quiet utility strip and accessible paper/dark theme control (no terminal-window chrome or decorative command prompt).
2. Name, current title and employer, and one short positioning statement grounded in the existing public résumé. Direct email, LinkedIn and GitHub links must be visible as text, not icons alone. The real portrait may remain in metadata but need not occupy the header.
3. Small section navigation if useful; on narrow phones it scrolls within its own rail, not the document. Experience begins within a standard phone's first viewport, targeted at 390 × 844, without shrinking the name into illegibility.
4. Experience in reverse chronological order with current role visible first. Existing roles, achievements, dates and citations remain available; improve hierarchy, spacing and bullet scanning rather than deleting material. Projects and skills should be accessible next, with education, certifications, recognition, publications and extra links afterward. Preserve anchor links when sections move.
5. Avoid duplicated focus chips, a second long biography and redundant contact blocks above experience. Preserve any longer narrative only if it provides distinct evidence elsewhere; do not repeat the same statement in three sections.

## Visual and implementation contract

Use the supplied `Irfan Devs Design System.zip` as the palette/typographic source: restrained green accents, readable paper and dark surfaces, disciplined rules, and monospaced details. Prioritize contrast and normal reading size over strict imitation of a developer-terminal shell. Adapt the existing Sass/Jekyll layout in `_layouts/resume.html`, `_config.yml`, `_sass/`, `_includes/head.html` and existing navigation script as needed. Do not replace the generator or duplicate résumé data in a JavaScript object. Avoid a new runtime dependency. Keep metadata, schema.org identity, social links and canonical URL accurate.

The layout must work without JavaScript except theme persistence/navigation enhancement. The theme control must be keyboard-operable with a visible label and appropriate pressed state; honor the chosen theme on reload, default to a legible paper scheme, and force paper in print. Use semantic header/nav/main/section hierarchy, a skip link and focus-visible styles. Avoid stale “last updated” claims: only show a date tied to an actual content review, not simply a CSS release.

## Public-content boundary

Employer names and personal contact details already intentionally public on the résumé are allowed for Irfan's review; do not add private-person details, confidential company data, internal metrics or names, private-file paths, tokens or unverifiable achievements. The sketch contains shortened illustrative claims, not approved replacements for existing experience. Review source, generated HTML, metadata, links and screenshots before publication. If a current claim seems internal or sensitive, flag it without repeating it in the public-facing preview and ask Irfan rather than inventing a sanitized claim.

## Verification and acceptance

- Add failing regression tests for header order and absence of overloaded old elements, anchor links, accessible contact/theme controls, and unchanged source-backed role details before production edits.
- Build the real Jekyll site locally and inspect generated HTML, not just a throwaway sketch. Verify phone widths 320 and 390, short phone, tablet and desktop; examine the first viewport, print, paper and dark, horizontal overflow, keyboard access, section links, and browser console. Capture local desktop and phone screenshots and give them to Irfan for review.
- Run the repo's available tests plus build/validation and `git diff --check`. Investigate a supported local Jekyll runtime because Ruby/Bundler are not currently installed on this host; do not claim a build succeeded until it has run.
- Keep the change local until Irfan approves the actual implementation. A design-sketch screenshot is not evidence that production Jekyll renders correctly.

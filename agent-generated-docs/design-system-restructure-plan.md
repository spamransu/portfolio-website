# Design System Restructure Plan

Date: 2026-07-22
Project: Portfolio Website
Stack: React 19 + Vite 7 + Sass modules
Skill used: `ui-ux-pro-max`

## Context checked

- Project instructions: keep this site content-first, case-study oriented, and easy for humans/agents to navigate.
- Main implementation layers:
  - `src/styles/tokens.scss` — Sass primitives, type styles, color maps, spacing, radii, helpers.
  - `src/styles/base.scss` — runtime CSS custom properties and base element styles.
  - `src/styles/grid.scss` — `.sm-wrapper`, `.md-wrapper`, `.lg-wrapper` ownership of wrapper widths.
  - `src/styles/layout.scss`, `utilities.scss`, `patterns.scss` — global reusable classes.
  - `src/components/*.module.scss`, `src/pages/HomePage.module.scss` — component/page modules.
- Existing reference docs:
  - `docs/portfolio-project-design-variables.json` — Figma-derived typography source.
  - `agent-generated-docs/typography-system.md` — current type system note.
  - `agent-generated-docs/color-token-migration-plan.md` — color-token cleanup direction.
  - `agent-generated-docs/project-scss-reference.md` — SCSS architecture reference.
- Existing repo contract: all `tokens.fluid(...)` clamps should use the approved 767px to 1366px interpolation range.

## UI/UX Pro Max takeaways to adapt, not blindly copy

The skill returned a portfolio/case-study direction: portfolio grid, visuals first, dark cinematic/editorial tone, project-card CTA emphasis, minimal accent color, spacious density, standard/subtle motion, and responsive/accessibility checks at 375px, 768px, 1024px, and 1440px.

Important adaptation: the repo already has a real brand basis: dark ink background, cream text, lime/orange/violet accents, Oswald display, Quattrocento body, and Figma-derived type values. We should preserve those instead of replacing them with the skill’s generic Archivo/Space Grotesk or slate/green palette.

## Current design-system strengths

1. Colors are centralized: raw color values are currently contained in `src/styles/tokens.scss`.
2. Typography is already tokenized from `docs/portfolio-project-design-variables.json`.
3. Spacing uses a shared `tokens.fluid(...)` helper with the correct 767px-1366px viewport range.
4. Wrapper widths are centralized in `src/styles/grid.scss`.
5. The site is already content-first and renders most page copy from `content/site-content.json`.

## Current design-system friction

1. `tokens.scss` is carrying too many responsibilities: primitives, semantic decisions, type roles, spacing, radii, shadows, transitions, and helper functions are all in one file.
2. Component-level decisions are not clearly named as component tokens. Examples: card padding, button padding, form padding, chrome spacing, footer spacing, and measurements live in `base.scss`, not in a documented component-token layer.
3. Motion is hardcoded in modules (`140ms`, `180ms`) and lacks a project-wide reduced-motion contract.
4. Button styles are duplicated between global `.button` and `HomePage.module.scss` `.primaryButton`.
5. Some token names are semantically leaky: `--space-hairline` is used as border radius in form fields, but spacing and radius should be separate token families.
6. The design system is implemented in code, but there is no current master “how to use this system” document that maps tokens to components/pages.
7. Accessibility primitives exist (`:focus-visible`, labels, ARIA form errors), but skip-link, motion-reduction, touch-target, and route-level heading checks should be explicitly validated.

## Restructure goal

Create a clearer layered design system without changing the visual identity unnecessarily:

1. Preserve the current portfolio voice: dark editorial, high-contrast, case-study oriented, restrained accent use.
2. Split token responsibilities so future edits have an obvious home.
3. Promote repeated component decisions into semantic tokens/mixins.
4. Reduce duplicate styles between global utilities and modules.
5. Add explicit accessibility, interaction, and motion contracts.
6. Keep wrappers, content source, and generated docs rules intact.

## Proposed architecture

### Layer 1 — Source and documentation

- Keep `docs/portfolio-project-design-variables.json` as the raw design export/source input.
- Add or replace a concise master reference at `agent-generated-docs/design-system.md` after implementation.
- Keep implementation notes out of the repo root.

### Layer 2 — Sass foundation

Refactor toward focused partials while keeping the public API stable during migration:

- `src/styles/tokens.scss`
  - Either remains the facade that forwards focused files, or stays as the single import path while internals are split.
  - Public helpers to preserve: `tokens.fluid(...)`, `tokens.color(...)`, `tokens.space(...)`, `tokens.radius(...)`, `tokens.type-prop(...)`.
- Candidate split if we choose physical separation:
  - `src/styles/tokens/_core.scss` — fluid range, strip-unit, shared helpers.
  - `src/styles/tokens/_typography.scss` — font families, `$type-styles`, type helpers.
  - `src/styles/tokens/_color.scss` — primitives, semantic colors, alpha colors, legacy aliases.
  - `src/styles/tokens/_space.scss` — base spacing and semantic spacing aliases.
  - `src/styles/tokens/_effects.scss` — radii, shadow, motion durations/easing.
  - `src/styles/tokens.scss` — forwards/re-exports the above.

Keep this split optional until implementation starts; if Sass namespace churn looks too risky, do a “logical restructure” inside the current file first.

### Layer 3 — Runtime custom properties

Move `:root` custom properties in `src/styles/base.scss` into clearer groups:

1. Color semantics
2. Legacy aliases, temporarily retained for safe migration
3. Typography roles
4. Spacing scale
5. Semantic layout spacing
6. Measures and wrappers
7. Radii, shadow, motion
8. Component tokens: buttons, cards, forms, tags, header, footer, project cards

Example component-token direction:

```scss
--button-padding: var(--space-xs) var(--space-sm);
--button-min-block-size: 44px;
--button-radius: var(--radius-pill);
--button-transition: transform var(--motion-fast), border-color var(--motion-fast), background-color var(--motion-fast);
--card-padding: var(--space-sm);
--card-border: 1px solid var(--color-border-default);
--form-field-radius: var(--radius-sm);
```

### Layer 4 — Mixins and utilities

- Keep `mix.type-style(...)`, `mix.flex(...)`, `mix.mq(...)`, and `mix.focus-ring`.
- Add/standardize small mixins only when they remove real repetition:
  - `mix.interactive-transition(...)`
  - `mix.touch-target`
  - `mix.reduced-motion`
  - maybe `mix.button-base` if it simplifies global and home button duplication.
- Avoid adding broad defensive mixins or generic utilities that are not used.

### Layer 5 — Components and pages

Prioritize shared components before page-specific modules:

1. `SiteHeader` — keep strict one-row, two-column layout; validate no mobile overflow.
2. `PageHeader` + `Section` — normalize heading, intro, and section rhythm.
3. Buttons/links — merge `.button`, `.primaryButton`, `.submitButton` behavior around shared button tokens.
4. `ProjectCard` + homepage project cards — align project-card hierarchy while preserving home’s visual-first layout.
5. `ContactForm` — preserve labels/inline errors, fix radius semantics, enforce 44px+ targets.
6. `SiteFooter` — align icon/touch target sizing with interaction tokens.
7. `HomePage.module.scss` — reduce duplicated section/card/pill/button patterns only after shared tokens exist.

## Implementation phases

### Phase 0 — Baseline and guardrails

- Capture `git status` before edits and avoid touching existing unrelated changes.
- Run current validation once: `pnpm exec eslint src`, `pnpm run build`, and `pnpm run lint:colors` if available.
- If visual verification is needed, store Playwright artifacts under `.playwright/`, `.playwright-cli/`, or `.playwright-mcp/` only.

### Phase 1 — Design-system inventory

- Inventory all Sass module usage of:
  - colors
  - spacing
  - radii
  - transitions/motion
  - wrappers/measures
  - repeated button/card/form/tag patterns
- Classify each as primitive, semantic, component token, utility, or one-off layout intent.
- Confirm no raw color values outside `src/styles/tokens.scss`.

### Phase 2 — Token taxonomy cleanup

- Reorganize token maps and custom properties into named groups.
- Add missing semantic tokens for component behavior: interactive min-size, motion duration/easing, card/button/form/tag/header/footer/project-card properties.
- Replace semantically wrong usages like radius from `--space-hairline` with radius tokens.
- Keep legacy aliases temporarily to avoid a risky big-bang migration.

### Phase 3 — Shared primitives/components

- Refactor `.button`, homepage `.primaryButton`, and form `.submitButton` toward shared button tokens/mixins.
- Normalize tag/pill styles across `.tag-list`, `.check-list`, homepage stack pills, and skill pills.
- Normalize card/surface/bordered-start patterns without over-rounding inner pages.
- Keep page content and markup stable unless accessibility requires a markup fix.

### Phase 4 — Accessibility and interaction hardening

- Add or verify skip-to-main behavior in `RootLayout` if missing.
- Ensure focus states remain visible on all interactive elements.
- Ensure clickable controls meet the 44px target or have enough spacing where compact text links are intentional.
- Add a `prefers-reduced-motion: reduce` rule for smooth scroll and transforms/transitions.
- Check heading hierarchy across home, about, projects, project detail, contact, resume, and 404.

### Phase 5 — Responsive/layout audit

- Validate the wrapper contract remains owned by `.sm-wrapper`, `.md-wrapper`, `.lg-wrapper`.
- Check breakpoints at 375px, 768px, 1024px, and 1440px.
- Specifically check header one-row/two-column behavior and no horizontal scroll.
- Preserve the 767px-1366px clamp range.

### Phase 6 — Documentation and enforcement

- Write `agent-generated-docs/design-system.md` as the current source-of-truth guide for agents.
- Update existing docs only where they are outdated; do not create conflicting parallel instructions.
- Keep `scripts/check-color-tokens.mjs` in the validation path and consider adding a motion/token lint later only if repetition returns.

### Phase 7 — Validation and final review

- Run:
  - `pnpm exec eslint src`
  - `pnpm run lint:colors`
  - `pnpm run build`
- If CSS/helper changes affect compiled output, inspect generated CSS for clamp correctness.
- Optional visual pass with Playwright at 375, 768, 1024, and 1440 widths, with artifacts kept out of root.

## Suggested first implementation slice

Start small enough to review cleanly:

1. Add motion/radius/component-token groups in `src/styles/base.scss` and matching values in `src/styles/tokens.scss`.
2. Replace hardcoded transition durations with motion variables.
3. Replace radius-from-spacing usages in `ContactForm.module.scss` with radius variables.
4. Merge homepage primary button styling toward the global button system without changing the visible CTA.
5. Add reduced-motion handling.
6. Validate with lint, color lint, and build.

This gives immediate design-system structure benefits without restructuring every Sass file at once.

## Acceptance criteria

- No visual identity reset: colors, typography, and content hierarchy still feel like the existing portfolio.
- Tokens have clearer homes and names.
- Component modules consume semantic variables instead of repeating behavior values.
- Motion has a shared duration/easing and reduced-motion path.
- Header, wrappers, and clamp range contracts remain intact.
- Validation passes.
- New documentation lives in `agent-generated-docs/`, not the project root.

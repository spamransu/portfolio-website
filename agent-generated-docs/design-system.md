# Portfolio Website Design System

Updated: 2026-07-22
Scope: `/home/ransu/personal-projects/portfolio-website`

## Purpose

This is the working source of truth for the current portfolio design system. It preserves the existing dark editorial visual identity while making the Sass architecture easier to extend without scattering styling decisions across modules.

## Design principles

1. Preserve the portfolio voice: dark, high-contrast, case-study oriented, restrained accent color use.
2. Prefer semantic tokens over repeated local literals.
3. Keep wrapper widths owned by `src/styles/grid.scss`.
4. Keep typography driven by `docs/portfolio-project-design-variables.json` and the approved `767px`-`1366px` fluid clamp range.
5. Promote repeated interaction rules into shared mixins and runtime custom properties before adding one-off module styles.
6. Keep generated implementation docs in `agent-generated-docs/`.

## Source layers

### 1. Design source

- `docs/portfolio-project-design-variables.json` — Figma-derived typography input.
- `content/site-content.json` — primary content source.

### 2. Sass token foundation

- `src/styles/tokens.scss`
  - typography families and type roles
  - color primitives, semantic colors, alpha colors, and temporary legacy aliases
  - spacing, radii, effects, and component-token maps
  - public helpers: `tokens.fluid(...)`, `tokens.color(...)`, `tokens.space(...)`, `tokens.radius(...)`, `tokens.type-prop(...)`, `tokens.effect(...)`, `tokens.component-token(...)`

### 3. Runtime custom properties

- `src/styles/base.scss`
  - color semantics
  - legacy aliases kept for safe migration
  - spacing scale and semantic layout spacing
  - measures and wrapper-adjacent sizing
  - motion and interaction tokens
  - component tokens for buttons, cards, forms, tags, header links, footer icons, and project media

### 4. Shared mixins and global utilities

- `src/styles/mixins.scss`
  - `mix.type-style(...)`
  - `mix.button-base(...)`
  - `mix.pill-base(...)`
  - `mix.interactive-transition(...)`
  - `mix.touch-target(...)`
  - `mix.reduced-motion`
  - `mix.focus-ring`
- `src/styles/utilities.scss`
  - shared button variants
  - shared tag/check-list styling
  - skip link
  - text utility roles

### 5. Component and page consumption

Use component tokens before inventing new local values.

Current shared consumers include:

- `src/components/ContactForm.module.scss`
- `src/components/SiteHeader.module.scss`
- `src/components/SiteFooter.module.scss`
- `src/components/PageHeader.module.scss`
- `src/components/Section.module.scss`
- `src/components/ProjectCard.module.scss`
- `src/pages/HomePage.module.scss`

## Token groups to reuse first

### Color

- `--color-background-page`
- `--color-background-surface`
- `--color-text-primary`
- `--color-text-muted`
- `--color-action-primary`
- `--color-action-secondary`
- `--color-accent-violet`
- `--color-border-default`
- `--color-border-hover`

### Spacing and layout

- `--space-stack-tight`
- `--space-stack`
- `--space-stack-loose`
- `--space-section`
- `--space-section-compact`
- `--gap-grid`
- `--gap-inline`
- `--measure-prose`
- `--measure-intro`
- `--measure-copy`
- `--measure-sidebar`

### Motion and interaction

- `--motion-fast`
- `--motion-standard`
- `--motion-ease-standard`
- `--motion-ease-emphasized`
- `--interactive-lift`
- `--target-min-size`

### Component tokens

- `--button-padding`
- `--button-radius`
- `--button-min-block-size`
- `--card-padding`
- `--card-radius`
- `--form-padding`
- `--form-field-padding`
- `--form-field-radius`
- `--form-field-min-block-size`
- `--tag-padding`
- `--tag-radius`
- `--header-link-min-block-size`
- `--footer-icon-size`
- `--section-divider`
- `--page-header-title-measure`
- `--project-card-image-transition`

## Interaction and accessibility contract

- Keep visible `:focus-visible` treatment.
- Keep the skip link in `RootLayout` pointing to `#main-content`.
- Respect `prefers-reduced-motion: reduce` for smooth scroll and transitions.
- Keep interactive controls at or above the `44px` target unless a compact text link is intentional and sufficiently spaced.
- Do not replace form labels with placeholders.
- Preserve route-level heading structure: one page-level `h1`, nested `h2` section headings.

## Responsive contract

- Wrapper widths remain owned by `.sm-wrapper`, `.md-wrapper`, and `.lg-wrapper` in `src/styles/grid.scss`.
- Do not add competing wrapper `max-width` rules in component modules.
- Preserve the approved fluid interpolation range from `767px` to `1366px`.
- Audit major layouts at `375px`, `768px`, `1024px`, and `1440px` after meaningful layout changes.
- The header stays a one-row, two-column layout.

## Editing rules

1. If the change is semantic and reusable, add or reuse a top-level token first.
2. If the change is repeated across components, prefer a mixin or shared component token.
3. If the change is a one-off layout constraint with clear intent, keep it local.
4. Do not introduce raw color values outside `src/styles/tokens.scss`.
5. Do not use spacing tokens as substitutes for radius tokens.

## Validation

Run these before finishing styling changes:

```bash
pnpm exec eslint src
pnpm run lint:colors
pnpm run build
```

Optional visual pass: compare `375px`, `768px`, `1024px`, and `1440px`, and keep any generated artifacts inside `.playwright/`, `.playwright-cli/`, or `.playwright-mcp/`.

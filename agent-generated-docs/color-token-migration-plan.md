# Color Token Migration Plan

## Goal

Move all color-related CSS/SCSS in the portfolio site behind named tokens so component styles use semantic variables instead of raw hex, rgb/rgba, or one-off color values.

## Current state

- Canonical style entrypoint: `src/styles/index.scss`
- Token source today: `src/styles/tokens.scss`
- Runtime custom properties emitted in: `src/styles/base.scss`
- Existing design export: `docs/portfolio-project-design-variables.json`
- Existing token access pattern:
  - Sass map/function: `tokens.color(<key>)`
  - CSS custom properties: `var(--<token-name>)`
- Existing raw color usage outside `tokens.scss`:
  - `src/styles/mixins.scss`: translucent white card surface, transparent focus outline, accent focus ring
  - `src/styles/utilities.scss`: translucent white borders/backgrounds, transparent reset background
  - `src/components/SiteHeader.module.scss`: translucent text border
  - `src/components/SiteFooter.module.scss`: translucent text borders
  - `src/components/StatList.module.scss`: translucent white surface
  - `src/components/ContactForm.module.scss`: dark text alpha states, error red, transparent fields/borders
  - `src/pages/HomePage.module.scss`: transparent borders, translucent text borders/surfaces
- Current color tokens are mostly brand primitives: `bg`, `surface`, `surface-2`, `surface-light`, `text`, `text-dark`, `muted`, `line`, `accent`, `accent-2`, `accent-3`, `ink`.

## Token strategy

### 1. Keep primitives, add semantic aliases

Keep current primitives in `src/styles/tokens.scss`, but stop consuming them directly from component/module SCSS unless the component is defining a new semantic token.

Recommended map shape:

```scss
$colors: (
  primitive: (
    ink-900: #161614,
    ink-800: #1b1b19,
    ink-700: #222220,
    cream-50: #fcfff6,
    neutral-500: #a1a1a1,
    lime-500: #b6cf4f,
    orange-500: #ff5e32,
    violet-500: #7154eb,
    red-600: #b42318,
    transparent: transparent,
  ),
  semantic: (
    background-page: primitive ink-900,
    background-surface: primitive ink-700,
    background-surface-subtle: primitive ink-800,
    background-inverse: primitive cream-50,
    text-primary: primitive cream-50,
    text-inverse: primitive ink-900,
    text-muted: primitive neutral-500,
    action-primary: primitive lime-500,
    action-secondary: primitive orange-500,
    accent-violet: primitive violet-500,
    feedback-error: primitive red-600,
  ),
  alpha: (
    border-default: rgba(252, 255, 246, 0.24),
    border-subtle: rgba(252, 255, 246, 0.12),
    border-strong: rgba(252, 255, 246, 0.35),
    surface-overlay: rgba(252, 255, 246, 0.04),
    surface-card: rgba(255, 255, 255, 0.03),
    focus-ring: rgba(182, 207, 79, 0.24),
    form-border: rgba(22, 22, 20, 0.14),
    form-placeholder: rgba(22, 22, 20, 0.28),
    form-helper: rgba(22, 22, 20, 0.5),
    shadow-card: rgba(0, 0, 0, 0.2),
  ),
);
```

The exact names can be adjusted during implementation, but the key rule is: primitives describe color values, semantic tokens describe usage.

### 2. Expose every consumed token as CSS custom properties

Update `src/styles/base.scss` so `:root` exports color variables for component modules:

```scss
--color-background-page: #{tokens.color(background-page)};
--color-text-primary: #{tokens.color(text-primary)};
--color-border-subtle: #{tokens.color(border-subtle)};
```

Use the `--color-*` prefix for all color-related custom properties. Keep existing legacy variables temporarily only as aliases:

```scss
--bg: var(--color-background-page);
--text: var(--color-text-primary);
--line: var(--color-border-default);
```

Remove legacy aliases after all call sites have moved.

### 3. Define what counts as color-related

Tokenize these values:

- `color`
- `background`, `background-color`
- `border-color` and border shorthands with color values
- `outline-color` and outline shorthands with color values
- `box-shadow` color segments
- gradients and `color-mix()` inputs if introduced later
- state colors: hover, focus, error, placeholder, disabled

Allowed exceptions:

- `currentColor`, when the intent is inheritance
- `transparent`, only via `var(--color-transparent)` or a documented local semantic alias
- Non-color keywords in unrelated properties, for example `white-space: nowrap`

## Implementation phases

### Phase 1: Inventory and lock naming

1. Generate a raw color inventory from SCSS only:

   ```bash
   rg -n "#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|\b(white|black|transparent|currentColor)\b|color-mix\(|linear-gradient\(" src --glob '*.scss'
   ```

2. Ignore false positives like `white-space`.
3. Map each real value to a semantic name.
4. Compare against `docs/portfolio-project-design-variables.json`; use Figma names where they match portfolio usage, otherwise keep portfolio-specific semantic names.

### Phase 2: Restructure `src/styles/tokens.scss`

1. Add primitive, semantic, and alpha color maps.
2. Replace `@function color($key)` with a function that resolves semantic aliases and alpha tokens.
3. Keep old token keys as temporary aliases so this can land safely without a big-bang rewrite.
4. Move `$shadow-card` to derive from the tokenized shadow color:

   ```scss
   $shadow-card: 0 20px 50px color(shadow-card) !default;
   ```

### Phase 3: Export runtime variables in `src/styles/base.scss`

1. Add `--color-*` variables for every semantic and alpha token used outside global styles.
2. Keep legacy variables as aliases for one migration cycle.
3. Do not add raw colors to component modules.

### Phase 4: Migrate global style partials

Update these first because components inherit from them:

1. `src/styles/mixins.scss`
2. `src/styles/patterns.scss`
3. `src/styles/utilities.scss`
4. `src/styles/layout.scss`, `grid.scss`, `base.scss` if new raw colors are found

Preferred pattern inside shared SCSS partials:

```scss
background: var(--color-surface-card);
box-shadow: 0 0 0 3px var(--color-focus-ring);
```

Use Sass `tokens.color()` only when generating CSS variables or reusable mixin defaults.

### Phase 5: Migrate component and page modules

Recommended order:

1. `src/components/SiteHeader.module.scss`
2. `src/components/SiteFooter.module.scss`
3. `src/components/StatList.module.scss`
4. `src/pages/HomePage.module.scss`
5. `src/components/ContactForm.module.scss`

`ContactForm.module.scss` should get dedicated form tokens rather than reusing generic text tokens for alpha states:

- `--color-form-helper`
- `--color-form-border`
- `--color-form-placeholder`
- `--color-feedback-error`

### Phase 6: Add enforcement

Add a lightweight check script, for example `scripts/check-color-tokens.mjs`, that fails when raw color literals appear outside approved files.

Approved files:

- `src/styles/tokens.scss`
- optionally `docs/portfolio-project-design-variables.json`, since it is source data

Check patterns:

- hex colors
- `rgb()` / `rgba()` / `hsl()` / `hsla()`
- `black` / `white` / `transparent` as standalone color keywords

Avoid false positives for non-color words like `white-space`.

Wire it into package scripts:

```json
"lint:colors": "node scripts/check-color-tokens.mjs"
```

Then include it in the validation path or run it before `pnpm exec eslint src`.

### Phase 7: Validate visual parity

1. Run color-token check.
2. Run lint:

   ```bash
   pnpm exec eslint src
   ```

3. Run build:

   ```bash
   pnpm build
   ```

4. Visually inspect key routes after changes:

   - `/`
   - `/about`
   - `/projects`
   - `/resume`
   - `/contact`

Keep Playwright artifacts inside `.playwright/`, `.playwright-cli/`, or `.playwright-mcp/`.

## Acceptance criteria

- No raw color literals outside `src/styles/tokens.scss`, except documented source data.
- All component/page modules consume `var(--color-*)` variables for color values.
- Sass token functions remain centralized in `src/styles/tokens.scss`.
- Legacy variables like `--bg`, `--text`, `--line`, `--accent` are either removed or aliases only.
- `pnpm exec eslint src`, `pnpm build`, and `pnpm run lint:colors` pass.
- Main routes preserve the current visual design unless a specific token rename intentionally changes it.

## Suggested first implementation slice

Do this as the first small PR/commit:

1. Add semantic and alpha tokens to `src/styles/tokens.scss` while keeping legacy aliases.
2. Export `--color-*` variables from `src/styles/base.scss`.
3. Migrate only shared partials: `mixins.scss`, `utilities.scss`, `patterns.scss`.
4. Add `scripts/check-color-tokens.mjs` but initially run it in report mode.
5. Validate with `pnpm exec eslint src` and `pnpm build`.

After that, migrate component/page modules in a second pass and turn the color-token script into a failing check.

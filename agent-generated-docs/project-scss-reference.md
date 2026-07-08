# ABCDE SCSS Reference for the Portfolio Website

## Overview of the SCSS system

The SCSS setup in `/home/ransu/personal-projects/abcde-main` is a hybrid system:

- global SCSS for reset, fonts, wrappers, and helper classes
- SCSS modules for almost every page and component
- shared design tokens exposed through Sass maps and variables
- two core mixins doing most of the work: `mix.font(...)` and `mix.flex(...)`
- heavy use of `clamp(...)` for fluid spacing and type
- mostly component-local styling, with a small global layout layer

In practice, the styling system is **module-first with a thin global foundation**.

What it does well:

- keeps most styles close to components
- centralizes typography, colors, and a few layout tokens
- makes fluid spacing/type the default
- uses global wrappers consistently for page width

What is rough or inconsistent:

- naming conventions are mixed: BEM-like, snake_case, camelCase, and kebab-case all appear together
- breakpoint values are defined in Sass variables, but many modules hardcode `768px`, `767px`, `1439px`, etc.
- `abstracts/_functions.scss` exists but is barely used
- `base/_typography.scss` is effectively empty
- some patterns are duplicated instead of extracted, especially in case-study pages and form controls
- Vite injects shared Sass imports automatically, so module files use `mix` and `abst` without declaring them locally

For the portfolio site, the right takeaway is:

- keep the module-first approach
- keep the token layer
- keep the fluid sizing idea
- simplify the naming system
- reduce the number of one-off helpers and magic numbers

## Folder and file structure

### Global style entry points

- `src/assets/styles/index.scss`
  - reset/normalize layer
  - base element rules: `html`, `body`, headings, links, lists, etc.
  - sets `main` top spacing for fixed navigation
- `src/assets/styles/App.scss`
  - loads the global base partials
  - acts as the foundation entry imported by `src/app/App.tsx`

### Shared Sass layer

- `src/assets/styles/abstracts/_index.scss`
  - forwards variables, mixins, and functions
- `src/assets/styles/abstracts/_variables.scss`
  - font families
  - fluid type tokens
  - line-height tokens
  - color tokens and Sass color map
  - transition token
  - max-width token
  - breakpoint map
  - base asset URL
- `src/assets/styles/abstracts/_mixins.scss`
  - `font(...)`
  - `flex(...)`
  - unused/rarely used helpers like `on-event`, `when-inside`, and `strip-unit`
- `src/assets/styles/abstracts/_functions.scss`
  - asset URL helpers: `asset()`, `image()`, `font()`
  - present but not central to the system

### Global base partials

- `src/assets/styles/base/_base.scss`
  - body background
  - selection colors
  - `.fade-in`
  - `#smooth-content` for smooth-scroll setup
- `src/assets/styles/base/_fonts.scss`
  - all `@font-face` declarations
- `src/assets/styles/base/_grid.scss`
  - global wrapper classes:
    - `.sm-wrapper`
    - `.md-wrapper`
    - `.lg-wrapper`
    - `.full-width`
  - these are the main page-layout primitives
- `src/assets/styles/base/_helpers.scss`
  - `.container`, `.clearfix`, `.hide-text`, `.sr_only`, `.styled__text`
- `src/assets/styles/base/_typography.scss`
  - currently empty apart from imports
  - looks like a planned but unfinished typography layer

### Component and page styles

SCSS modules live next to the component or page they style.

Main groups:

- `src/components/ui/*.module.scss`
  - buttons, modal, cards, marquee, FAQ accordion, error boundary
- `src/components/layout/**/*.module.scss`
  - shared sections and page blocks
- `src/components/features/**/*.module.scss`
  - process section, service section, subscribe form pieces
- `src/pages/**/*.module.scss`
  - page-level layout and case-study page styling
- `src/assets/animations/*.module.scss`
  - styling for animation-specific visual elements
- `src/plugins/imageloader/imageLoader.module.scss`
  - plugin-level presentational styling

### Important build behavior

In `vite.config.ts`, SCSS gets shared imports injected automatically:

```scss
@use "@styles/abstracts/" as abst;
@use "@/assets/styles/abstracts/mixins" as mix;
```

That means most module files only declare:

```scss
@use 'sass:map';
```

and still access `abst.$colors`, `abst.$text-base`, `mix.font(...)`, and `mix.flex(...)`.

This is convenient, but it also hides dependencies. For a smaller portfolio project, it is fine to keep this if you want less boilerplate, but document it clearly.

## Naming conventions

The project does **not** follow one strict convention.

### What appears in the repo

1. BEM-like double-underscore names
   - `.hero__text`
   - `.header__wrapper`
   - `.brand_clr__wrapper`
   - `.project__wrapper`

2. Snake/camel mixed names
   - `.topSection_wrapper`
   - `.brandClr_wrapper`
   - `.buttonGroup`
   - `.burgerActive`

3. Kebab-case mostly for modifiers and variants
   - `.variant-primary`
   - `.variant-outline-light`
   - `.size-sm`
   - `.full-width`

4. State classes attached with nesting
   - `&.active`
   - `&.error`
   - `:hover`, `:focus`, `:checked`, `:disabled`

### Pattern behind the naming

Even though the naming is inconsistent, the intent is fairly clear:

- `wrapper`, `container`, `content`, `header`, `title`, `description`, `image` are the default structural nouns
- component root classes are often simple: `.wrapper`, `.card`, `.form`, `.navigation`
- child parts are usually BEM-like: `.hero__text`, `.serviceOptions`, `.header__wrapper`
- variants are class-based, especially for buttons and interactive states

### Recommendation for the portfolio

Use one naming rule only:

- SCSS modules: simple local names or BEM-like names only
- modifiers: `--modifier`
- states: `.is-active`, `.is-error`, `.is-open`

Recommended portfolio direction:

```scss
.card {}
.card__media {}
.card__title {}
.card--featured {}
.is-loading {}
```

Do not carry forward the mixed forms like `topSection_wrapper`, `brandClr_wrapper`, and `buttonGroup` in the same codebase.

## Reusable mixins, variables, and utilities

### What is worth reusing as-is

#### 1. Color map + token access

```scss
$colors: (
  'text': $clr-black,
  'text-accent': $clr-teal,
  'background': $clr-off-white,
  'accent': $clr-lavender,
  'accent-secondary': $clr-pastel-green,
  'border': $clr-black,
);
```

Why keep it:

- consistent semantic color names
- easier theme updates
- better than scattering hex values through modules

For the portfolio, shrink the map to the tokens you actually use.

#### 2. `mix.font(...)`

```scss
@mixin font($family: 'primary', $weight: 400, $style: normal, $leading: 1) {
  font-family: map.get($font-families, $family), $ff-fallback;
  font-weight: $weight;
  font-style: $style;
  letter-spacing: $tracking-tight;
  line-height: $leading;
}
```

Why keep it:

- typography is consistent across modules
- switching between display/body/accent fonts stays simple

What to improve:

- allow more weights only if the portfolio really needs them
- make letter-spacing optional
- pair this with a smaller set of type scale tokens

#### 3. `mix.flex(...)`

```scss
@mixin flex($dir: row, $justify: null, $align: null, $gap: null, $wrap: null) {
  display: flex;
  flex-direction: $dir;
  @if $justify { justify-content: $justify; }
  @if $align { align-items: $align; }
  @if $gap { gap: $gap; }
  @if $wrap { flex-wrap: $wrap; }
}
```

Why keep it:

- removes repetitive flex boilerplate
- used heavily across the project

What to improve:

- keep it, but do not build many more abstraction mixins unless repetition is real

#### 4. Wrapper grid classes

The global wrappers are one of the strongest reusable patterns in the repo.

```scss
.sm-wrapper { ... }
.md-wrapper { ... }
.lg-wrapper { ... }
.full-width { grid-column: full-width; }
```

Why keep the idea:

- page width is standardized
- breakout/full-width sections are easy
- works well for a content-heavy marketing or portfolio site

What to improve:

- rename for clarity if needed: `.layout-sm`, `.layout-md`, `.layout-lg`
- keep only 1 or 2 widths if the portfolio does not need three

### What should be simplified

#### Unused or low-value helpers

These exist but are not central:

- `on-event(...)`
- `when-inside(...)`
- `asset()`, `image()`, `font()` Sass functions
- `base/_typography.scss`

For the portfolio, do not copy them unless a real need appears.

#### Helper classes

Useful global helpers are fine, but keep them small:

- screen-reader utility
- visually hidden utility
- maybe one text-accent utility

Do not rebuild a large utility-class system unless the site genuinely needs it.

## Responsive strategy

The project is responsive, but not purely mobile-first.

### What the repo actually does

- heavy use of `clamp(...)` for fluid spacing and typography
- many modules start with desktop/tablet layouts, then patch down with `@media (max-width: 768px)`
- some files switch layouts with `@media (min-width: 769px)`
- wrappers use fluid inline padding globally

The responsiveness is best described as:

- **fluid-first** for sizing
- **desktop/default + max-width overrides** for layout

### Evidence in the codebase

Common query patterns:

- `@media (max-width: 768px)` appears most often
- `@media (max-width: 767px)` and `767.97px` also appear
- `@media (min-width: 769px)` appears in a few components
- `1439px`, `1024px`, `900px`, `600px`, `520px`, `510px` appear as one-off breakpoints

### What to keep for the portfolio

Keep:

- `clamp(...)` for major spacing, section padding, and display sizes
- a small breakpoint set

Change:

- move to true mobile-first layouts where possible
- stop hardcoding breakpoint values in modules
- centralize breakpoints into 3 or 4 tokens only

Recommended portfolio breakpoint model:

```scss
$breakpoints: (
  'sm': 480px,
  'md': 768px,
  'lg': 1024px,
  'xl': 1280px,
);
```

Then wrap queries in a small mixin:

```scss
@mixin mq($key) {
  @media (min-width: map.get($breakpoints, $key)) {
    @content;
  }
}
```

Why:

- fewer breakpoint mismatches
- easier to scan and maintain
- cleaner than mixing `767`, `768`, and `769`

## Component styling patterns

## Buttons

Pattern in the repo:

- one base button style
- variants via extra classes
- size classes via extra classes
- hover states handled at the variant level

Example:

```scss
.size-sm { padding: clamp(8px, 2.336px + 0.943vw, 12px) 20px; }
.variant-primary { background: transparent; }
.variant-secondary { background: map.get(abst.$colors, 'accent-secondary'); }
```

Keep for the portfolio:

- one `.button` base
- 2 variants max: primary and secondary/ghost
- 2 sizes max: sm and md

Do not carry over five variants unless the site actually needs them.

## Forms

Pattern in the repo:

- form controls reuse a shared input look
- error state is class-based
- focus styles are explicit and accessible
- layout uses grid + flex

Strong reusable pattern:

```scss
.input {
  padding: 12px;
  border: 1px solid map.get(abst.$colors, 'border');

  &:focus {
    outline: none;
    border-color: map.get(abst.$colors, 'text-accent');
    box-shadow: 0 0 0 2px rgba(map.get(abst.$colors, 'text-accent'), 0.2);
  }

  &.error {
    border-color: abst.$error;
  }
}
```

Keep:

- accessible focus states
- a single control style shared by input, textarea, and select

Improve:

- avoid duplicating subscribe-form input styles and contact-form input styles
- create one shared form partial or module for the portfolio

## Cards and sections

Pattern in the repo:

- cards and sections are usually flex or grid containers
- internal spacing uses `clamp(...)`
- borders are favored over shadows in many sections
- section roots are often named `.wrapper`

Examples:

- testimonial card: border, radius, hover background shift
- project card: flex stack with image wrapper and title
- service/process sections: two-column grid collapsing to one column

Reusable rule for the portfolio:

- build a small set of section patterns instead of unique wrappers everywhere:
  - section shell
  - card
  - split layout
  - stack layout

## Typography

Pattern in the repo:

- display/headline text usually uses the secondary serif font
- body and labels use the primary sans font
- italic accent text is often separate rather than using a special component

Typical structure:

```scss
.hero__text {
  @include mix.font('secondary', 400, normal, 1.2);
  font-size: abst.$text-4xl;
}

.hero__paragraph {
  @include mix.font('primary', 300, normal, 1.25);
  font-size: abst.$text-base;
}
```

Keep:

- one display font + one body font
- semantic type tokens

Improve:

- define actual text roles for the portfolio: `display`, `h1`, `h2`, `body`, `meta`, `label`
- avoid scattering slightly different line-height combinations everywhere

## Color and branding blocks

Pattern in the repo:

- several case-study pages build custom brand color grids and showcase blocks
- many of these are page-specific, visual-case-study patterns

These are **project-specific**, not core system patterns.

Keep only the underlying idea:

- allow page-specific accent blocks when presenting portfolio projects

Do not copy:

- case-study-specific class naming
- one-off color stripe components unless your portfolio actually includes visual identity case studies

## Layout and wrappers

Pattern in the repo:

- page shells often use global wrapper classes in markup
- modules handle internal layout only
- sections frequently use `display: flex` or `display: grid`

This is worth carrying forward.

Recommended principle:

- global layout width belongs to a small global layer
- component internals belong to modules

## Project-specific patterns vs reusable patterns

### Project-specific patterns

These belong to ABCDE's agency/case-study site and should not be copied blindly:

- case-study page modules with custom brand-color grids
- many one-off class names for art-directed sections
- duplicated `PerfectFitSection` variants for different page contexts
- animation-specific wrappers tied to GSAP scenes
- multiple button variants tailored to specific sales and inquiry flows
- legal-page and services-page custom shells that reflect that site's content model

### Reusable patterns

These are worth carrying forward:

- SCSS modules colocated with components
- one global reset file
- one global layout/wrapper file
- one token file for colors, spacing, type, and breakpoints
- one small mixin file
- fluid `clamp(...)` sizing for major spaces and headings
- semantic color names
- shared focus/error styles for forms
- a small button variant system
- grid/flex section patterns instead of page-by-page reinvention

## Suggested SCSS architecture for the portfolio project

The portfolio site should be simpler than ABCDE.

Right now `/home/ransu/personal-projects/portfolio-website/src/styles/main.scss` is one large stylesheet using CSS custom properties. That is already manageable. If you want to bring over ABCDE's useful structure without overbuilding, use this middle ground:

```text
src/
  styles/
    index.scss                # reset + base HTML elements
    tokens.scss               # Sass tokens and CSS variables bridge
    mixins.scss               # mq, flex, text-style helpers
    layout.scss               # wrappers, section shell, stack/split helpers
    utilities.scss            # sr-only, visually-hidden, maybe one or two helpers
  components/
    ui/
      Button/
        Button.tsx
        Button.module.scss
      Card/
        Card.tsx
        Card.module.scss
    sections/
      Hero/
        Hero.tsx
        Hero.module.scss
      ProjectGrid/
        ProjectGrid.tsx
        ProjectGrid.module.scss
      ContactBlock/
        ContactBlock.tsx
        ContactBlock.module.scss
```

### Why this is the right level

- enough structure to avoid another giant stylesheet
- much smaller than the ABCDE setup
- easy to reason about in a solo portfolio project
- keeps global concerns global and component concerns local

## Migration/reuse plan

### Phase 1: Keep the current portfolio stylesheet working

Do not rewrite the portfolio styling system all at once.

Start by keeping `/home/ransu/personal-projects/portfolio-website/src/styles/main.scss` as the active stylesheet.

### Phase 2: Pull over only the good primitives

Reuse these ideas first:

1. token naming
   - text/background/border/accent instead of raw hex names in component code
2. small mixin set
   - `flex(...)`
   - `mq(...)`
   - optional `text-style(...)`
3. wrapper classes
   - one standard content width
   - one wide layout width if needed
4. button pattern
   - base + modifiers
5. form-control pattern
   - shared focus/error styling

### Phase 3: Normalize naming before adding more components

Before building many portfolio sections:

- choose BEM-like or simple module-local naming
- standardize modifier naming
- standardize state naming
- remove mixed underscore/camel patterns

### Phase 4: Replace one-off section styles with reusable section shells

Instead of making a fresh wrapper pattern for every page section, create:

- `.section`
- `.section__header`
- `.section__content`
- `.stack`
- `.split`
- `.card`

This is the main simplification ABCDE did not fully make.

### Phase 5: Audit breakpoints

Before the portfolio grows:

- define breakpoints once
- use them through a mixin
- remove any ad hoc values that drift from the standard set

## Do and don't guidelines

### Do

- keep styles colocated with components
- keep one small global foundation
- keep semantic tokens for color/type/spacing
- use `clamp(...)` for hero sizes and section spacing
- use a shared button and form-control pattern
- keep wrapper/layout classes global and minimal
- prefer one section system over many bespoke wrappers
- make responsive rules token-driven

### Don't

- do not copy every partial and helper just because it exists
- do not bring over unused Sass functions and half-finished typography files
- do not mix `768`, `767`, and `769` breakpoints in the new project
- do not keep mixed naming conventions
- do not create a separate SCSS module for every tiny visual variation if a modifier will do
- do not rebuild a full design-system layer for a small portfolio
- do not duplicate form styles in multiple places

## Recommended Portfolio SCSS Blueprint

Use this as the carry-forward version, not a full clone of ABCDE.

```text
/home/ransu/personal-projects/portfolio-website/src/
  styles/
    index.scss
    tokens.scss
    mixins.scss
    layout.scss
    utilities.scss
  components/
    ui/
      Button/
        Button.tsx
        Button.module.scss
      Card/
        Card.tsx
        Card.module.scss
      Input/
        Input.module.scss
    sections/
      Hero/
        Hero.tsx
        Hero.module.scss
      Section/
        Section.module.scss
      ProjectGrid/
        ProjectGrid.tsx
        ProjectGrid.module.scss
      ContactBlock/
        ContactBlock.tsx
        ContactBlock.module.scss
```

### Styling approach to carry forward

1. Global files handle only:
   - reset
   - tokens
   - wrappers
   - tiny utilities

2. Modules handle:
   - component structure
   - local spacing
   - local states
   - local variants

3. Tokens should cover only:
   - colors
   - type scale
   - spacing scale
   - breakpoints
   - radius
   - shadow if needed

4. Naming should be:
   - `.component`
   - `.component__part`
   - `.component--variant`
   - `.is-state`

5. Responsive strategy should be:
   - mobile-first layout
   - fluid sizing with `clamp(...)`
   - breakpoint mixin, no hardcoded query values in modules

6. Reuse from ABCDE:
   - token mindset
   - `font` and `flex` mixins, simplified
   - wrapper layout pattern
   - button and form-control structure

7. Do not reuse from ABCDE:
   - mixed naming conventions
   - extra Sass helpers that are not pulling their weight
   - duplicated case-study layout patterns
   - scattered breakpoint values

If you adopt only those pieces, the portfolio styling system stays clean, familiar, and much easier to maintain than the original source project.

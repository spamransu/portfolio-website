# Portfolio typography system

Source: `docs/portfolio-project-design-variables.json` → `Responsive` collection.

## Scale

The Figma export includes real `Desktop` and `Mobile` typography values. The `Tablet` mode is currently exported as zeroes, so the code uses fluid CSS `clamp()` values between the portfolio breakpoints `767px` and `1366px`, following the Gorriceta project pattern from session `019f44f2-3a6d-7450-a396-578ba2691dd4`.

| Token | 767px | 1366px | Line height |
| --- | ---: | ---: | --- |
| `h1` | 48px | 60px | 56px → 72px |
| `h2` | 40px | 48px | 48px → 56px |
| `h3` | 32px | 40px | 40px → 48px |
| `h4` | 28px | 32px | 32px → 40px |
| `h5` | 24px | 24px | 28px |
| `h6` | 20px | 20px | 24px |
| `body-lg` | 20px | 20px | 24px |
| `body-md` | 16px | 16px | 20px |
| `body-sm` | 14px | 14px | 16px |
| `body-xs` | 12px | 12px | 16px |

Note: mobile `h4` line-height is zero in the export. The system uses its mobile paragraph spacing value, 32px, to keep the rhythm consistent.

## Code usage

- SCSS tokens live in `src/styles/tokens.scss` as `$type-styles`.
- Fluid values are generated with `tokens.fluid(<min>, <max>)`, which locks interpolation to 767px–1366px.
- Component usage should prefer `@include mix.type-style(<token>)` from `src/styles/mixins.scss`.
- Global element defaults and CSS custom properties are emitted in `src/styles/base.scss`.
- Utility classes live in `src/styles/utilities.scss`:
  - `.text-h1` through `.text-h6`
  - `.text-body-lg`, `.text-body-md`, `.text-body-sm`, `.text-body-xs`

## Font families

- Display/headings: `Oswald`, then narrow/display fallbacks.
- Body/copy: `Quattrocento Sans`, then system sans-serif fallbacks.

# Homepage Figma Fix Tasks

Source comparison:
- Figma design: `https://www.figma.com/design/3yI6d08rPxh0P1qpjZQ7Ef/Codex-Access?node-id=132-1145&t=iX4ExyDbaI2nHDrE-4`
- Local implementation audited via Playwright at `/`

Goal:
- Make the homepage implementation match the linked Figma homepage more closely in structure, spacing, typography, content, and visual hierarchy.

## Working rules

1. Keep homepage content driven by `content/site-content.json`.
2. Prefer updating content in JSON before hardcoding anything in React.
3. After content or structure edits, run:
   - `pnpm run prebuild`
4. After layout or structural SCSS/TSX edits, also run:
   - `pnpm build`

## Priority 1 — content parity with the Figma design

### 1. Replace homepage content with Figma-matching content
- Update `/home/ransu/personal-projects/portfolio-website/content/site-content.json`
- Fix:
  - site name / brand text
  - hero eyebrow
  - hero headline
  - hero description
  - featured project titles, summaries, and stacks
  - bio eyebrow, heading, and body copy
  - stat values and labels
  - skills copy and skill items
  - contact intro copy
  - footer description and social labels
- Acceptance:
  - Homepage copy matches the design intent instead of the current placeholder portfolio copy.

### 2. Restore the missing Linktree nav item
- Review `/home/ransu/personal-projects/portfolio-website/content/site-content.json`
- Review `/home/ransu/personal-projects/portfolio-website/src/components/SiteHeader.tsx`
- Fix:
  - ensure a valid Linktree URL exists in content
  - ensure the header renders it visibly
- Acceptance:
  - Header shows `Linktree` like the Figma design.

## Priority 2 — layout and structure fixes

### 3. Match the hero section structure
- Review `/home/ransu/personal-projects/portfolio-website/src/pages/HomePage.tsx`
- Review `/home/ransu/personal-projects/portfolio-website/src/pages/HomePage.module.scss`
- Fix:
  - remove the secondary hero CTA (`View CV`) from the homepage hero
  - keep only the single primary CTA
  - tighten vertical spacing
  - reduce hero height so it aligns more closely with the Figma composition
  - adjust max widths so the headline block feels closer to the design
- Acceptance:
  - Hero has one CTA, tighter spacing, and a similar visual footprint to Figma.

### 4. Replace the fallback CTA card with a fourth featured project
- Review `/home/ransu/personal-projects/portfolio-website/src/pages/HomePage.tsx`
- Review `/home/ransu/personal-projects/portfolio-website/content/site-content.json`
- Fix:
  - provide four featured projects in content
  - stop rendering the fallback CTA card on the homepage when matching this design
- Acceptance:
  - Featured projects render as a 2x2 project grid, not 3 cards plus one CTA block.

### 5. Remove or reduce the extra featured-projects intro copy
- Review `/home/ransu/personal-projects/portfolio-website/src/pages/HomePage.tsx`
- Review `/home/ransu/personal-projects/portfolio-website/src/pages/HomePage.module.scss`
- Fix:
  - remove the descriptive paragraph under `FEATURED PROJECTS`, or restyle it only if absolutely needed after checking the design again
- Acceptance:
  - Section heading treatment matches the Figma section more closely.

### 6. Tighten the bio/about section composition
- Review `/home/ransu/personal-projects/portfolio-website/src/pages/HomePage.module.scss`
- Fix:
  - reduce oversized vertical gaps
  - bring the right-side paragraph closer to the heading block
  - make the section width and spacing feel more compact
  - tune heading line length and spacing toward the Figma layout
- Acceptance:
  - The bio section feels compact and balanced like the design.

### 7. Rebuild the stats row to match bordered cards
- Review `/home/ransu/personal-projects/portfolio-website/src/pages/HomePage.module.scss`
- Review `/home/ransu/personal-projects/portfolio-website/src/pages/HomePage.tsx`
- Fix:
  - switch from divider-style stats to bordered stat cards
  - match the three-column boxed look from the Figma design
  - keep centered labels and colored values
- Acceptance:
  - Stats look like distinct bordered boxes, not open columns with separators.

### 8. Tighten the skills section layout
- Review `/home/ransu/personal-projects/portfolio-website/src/pages/HomePage.module.scss`
- Fix:
  - make the pill cluster more compact and centered
  - reduce extra whitespace between skills and the `MY SKILLS` copy block
  - align the section more closely with the left-cluster/right-copy composition from Figma
- Acceptance:
  - Skills section has the same overall structure and density as the design.

### 9. Adjust the contact section proportions
- Review `/home/ransu/personal-projects/portfolio-website/src/pages/HomePage.module.scss`
- Review `/home/ransu/personal-projects/portfolio-website/src/pages/HomePage.tsx`
- Fix:
  - reduce contact card width/height to better match the design
  - tighten spacing between title, intro, labels, fields, and counter
  - match field heights and textarea height more closely
  - confirm the contact block sits with similar top/bottom padding inside the lime section
- Acceptance:
  - Contact form card proportions and spacing resemble the Figma layout.

### 10. Match the footer structure more closely
- Review `/home/ransu/personal-projects/portfolio-website/src/components/SiteFooter.tsx`
- Review `/home/ransu/personal-projects/portfolio-website/src/components/SiteFooter.module.scss`
- Fix:
  - reduce footer height and vertical spacing
  - align columns closer to Figma
  - replace text-only social links with icon treatment or an equivalent footer presentation that matches the design better
  - verify the brand/footer copy lines match content
- Acceptance:
  - Footer density, spacing, and social treatment are much closer to the design.

## Priority 3 — visual styling alignment

### 11. Tune header spacing and typography
- Review `/home/ransu/personal-projects/portfolio-website/src/components/SiteHeader.module.scss`
- Fix:
  - adjust header top/bottom padding
  - tighten nav spacing
  - verify brand scale and nav text size against the Figma header
- Acceptance:
  - Header sits and scales more like the design.

### 12. Tune section spacing across the whole homepage
- Review `/home/ransu/personal-projects/portfolio-website/src/pages/HomePage.module.scss`
- Fix:
  - reduce cumulative vertical spacing that is making the page too tall
  - compare hero, featured, bio, skills, contact, and footer spacing as one system
- Acceptance:
  - Overall page height is significantly closer to the Figma homepage.

### 13. Tune project card image and text rhythm
- Review `/home/ransu/personal-projects/portfolio-website/src/pages/HomePage.module.scss`
- Fix:
  - verify image aspect ratio and crop behavior
  - tune title size, summary spacing, and chip spacing
  - make the four cards read as a uniform grid
- Acceptance:
  - Project cards visually align with the Figma cards.

### 14. Tune form styling details
- Review `/home/ransu/personal-projects/portfolio-website/src/pages/HomePage.module.scss`
- Fix:
  - match placeholder contrast, border color, label spacing, corner radius, and button height
  - verify the black submit button and cream card align with the Figma design
- Acceptance:
  - Form feels visually closer to the design without changing behavior.

## Priority 4 — cleanup and verification

### 15. Remove homepage-only design mismatches that should not exist
- Review `/home/ransu/personal-projects/portfolio-website/src/pages/HomePage.tsx`
- Fix:
  - remove any homepage-only elements that are not present in the Figma design
  - especially check:
    - secondary hero CTA
    - featured archive CTA block
    - extra supporting copy blocks that lengthen sections
- Acceptance:
  - Homepage only contains sections and sub-elements supported by the design.

### 16. Run content/build verification
- Run:
  - `pnpm run prebuild`
  - `pnpm build`
- Acceptance:
  - Build passes with no regressions.

### 17. Re-audit with Playwright after fixes
- Re-run a Playwright screenshot of the homepage at desktop width `1440`
- Compare again against the same Figma node
- Acceptance:
  - Remaining differences are minor polish issues, not structural mismatches.

## Suggested implementation order

1. Update `content/site-content.json`
2. Fix header + hero
3. Fix featured projects structure
4. Fix bio + stats
5. Fix skills
6. Fix contact section
7. Fix footer
8. Tighten global spacing
9. Run prebuild/build
10. Re-audit with Playwright

## Key files

- `/home/ransu/personal-projects/portfolio-website/content/site-content.json`
- `/home/ransu/personal-projects/portfolio-website/src/pages/HomePage.tsx`
- `/home/ransu/personal-projects/portfolio-website/src/pages/HomePage.module.scss`
- `/home/ransu/personal-projects/portfolio-website/src/components/SiteHeader.tsx`
- `/home/ransu/personal-projects/portfolio-website/src/components/SiteHeader.module.scss`
- `/home/ransu/personal-projects/portfolio-website/src/components/SiteFooter.tsx`
- `/home/ransu/personal-projects/portfolio-website/src/components/SiteFooter.module.scss`

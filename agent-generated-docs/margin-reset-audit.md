# Margin reset audit

Spacing is now container-owned wherever possible: shared flow elements are normalized in `src/styles/base.scss`, while component layouts use `gap` and existing `--space-*` tokens. Remaining `margin-block: 0` declarations are intentional component boundaries, typography overrides, or accessibility positioning and should not be removed without checking the owning layout.

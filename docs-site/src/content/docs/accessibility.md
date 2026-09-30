---
title: Accessibility
description: The accessibility contract for a site that must work for every voter.
---

Accessibility is a product requirement, not a visual polish pass.

- Landmarks include a skip link, `main`, header, footer, navigation, labelled sections, and a useful document title.
- Every form control has a visible or screen-reader label, useful autocomplete, and associated help/error text.
- Loading, fallback, and lookup errors are announced through semantic alerts or live regions.
- Location and contest details use headings, native disclosures, keyboard-operable buttons, and visible focus styles.
- External links identify that they open a new tab for screen-reader users.
- Color is not the only signal for official status, fallback status, distance, or missing data.
- Light, dark, and system themes retain contrast. Reduced-motion preferences disable decorative movement.
- Print output removes controls and keeps the practical plan readable in black and white.

The release check combines Playwright keyboard smoke tests with `@axe-core/playwright`. Human testing with a screen reader remains valuable and is not replaced by automated checks.

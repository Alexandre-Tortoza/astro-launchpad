# Performance Review

Review an Astro Launchpad page build output and source for performance risks.

## Input

- Lighthouse report or PageSpeed Insights JSON when available
- Astro config, page source, and block payloads
- Any external fonts, third-party scripts, or image paths

## Instructions

1. Check against Core Web Vitals: LCP, CLS, INP (or FID).
2. Identify render-blocking resources (fonts, scripts, CSS above the fold).
3. Flag images without `width` and `height`, missing `loading="lazy"`, or missing `fetchpriority="high"` on the hero image.
4. Look for unnecessary client-side JavaScript islands that could be static.
5. Check for large JS bundles imported in the head or without `defer`.
6. Identify fonts not preloaded or not using `font-display: swap`.
7. Check whether the Tailwind stylesheet (if present) is purged correctly in production.
8. Do not recommend changes that would break accessibility or SEO to gain performance.

## Output

Return Markdown sorted by estimated impact: `High`, `Medium`, `Low`. Include the affected resource or component, the problem, and the recommended fix for each item.

## Quick checklist

- [ ] Hero image uses `fetchpriority="high"` and is not lazy-loaded
- [ ] Non-hero images use `loading="lazy"` and have `width`/`height`
- [ ] No render-blocking scripts in `<head>` (use `defer` or `type="module"`)
- [ ] Custom fonts are preloaded or use a variable font
- [ ] `font-display: swap` is set
- [ ] Astro islands are used only where interactivity is required
- [ ] No large CSS framework loaded globally if not used
- [ ] Lighthouse Performance score ≥ 90 on the default demo build
- [ ] CLS < 0.1 (no layout shifts from images or fonts)

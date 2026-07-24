# Theming

Astro Launchpad uses CSS custom properties (design tokens) as the single source of truth for the visual theme. The same tokens work with or without Tailwind.

## Design tokens

Tokens are defined in `src/styles/global.css` and used in block components via `var(--token-name)`.

| Token                        | Default            | Purpose              |
| ---------------------------- | ------------------ | -------------------- |
| `--color-background`         | `#ffffff`          | Page background      |
| `--color-foreground`         | `#0a0a0a`          | Default text         |
| `--color-muted`              | `#f5f5f5`          | Muted surfaces       |
| `--color-muted-foreground`   | `#737373`          | Secondary text       |
| `--color-primary`            | `#171717`          | Primary action color |
| `--color-primary-foreground` | `#fafafa`          | Text on primary      |
| `--color-accent`             | `#3b82f6`          | Accent / brand color |
| `--color-accent-foreground`  | `#ffffff`          | Text on accent       |
| `--color-border`             | `#e5e5e5`          | Borders and dividers |
| `--color-card`               | `#ffffff`          | Card backgrounds     |
| `--color-card-foreground`    | `#0a0a0a`          | Text on cards        |
| `--radius-sm/md/lg`          | `0.25–0.75rem`     | Border radius scale  |
| `--font-sans`                | `system-ui`        | Body font stack      |
| `--font-heading`             | `var(--font-sans)` | Heading font stack   |
| `--container-width`          | `72rem`            | Max page width       |

To change the theme, override tokens in `src/styles/global.css`:

```css
:root {
  --color-accent: #7c3aed;
  --font-heading: "Inter", sans-serif;
}
```

## Without Tailwind (default)

The base template uses CSS variables directly in block components and the global stylesheet. No utility framework required.

```css
/* Block-level usage */
.hero {
  background: var(--color-background);
  color: var(--color-foreground);
  max-width: var(--container-width);
}
```

## With Tailwind (feature pack)

When the Tailwind feature pack is applied, `@tailwindcss/vite` is added to `astro.config.mjs` and the stylesheet switches to a Tailwind v4 `@import "tailwindcss"` entry with `@theme` block that exposes all design tokens as Tailwind utilities.

This means you can use both approaches in the same component:

```astro
<div class="bg-background text-foreground max-w-[var(--container-width)]">
  ...
</div>
```

The `astro.config.mjs` change when Tailwind is applied:

```js
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

## Applying the Tailwind feature pack manually

If you did not choose Tailwind during project creation:

1. Install Tailwind: `pnpm add tailwindcss @tailwindcss/vite`
2. Copy `src/styles/global.css` from `templates/features/tailwind/`
3. Copy `astro.config.mjs` from `templates/features/tailwind/`

## Visual presets

Visual presets change the token values to create different looks. They are applied via the CLI preset selection and ship as CSS overrides on top of the default tokens.

| Preset         | Feel                                     |
| -------------- | ---------------------------------------- |
| Minimal        | Clean, low contrast, generous whitespace |
| SaaS Clean     | Bright accent, modern sans-serif         |
| Agency Bold    | Strong typography, saturated palette     |
| Local Business | Warm, approachable, classic              |
| Dark Startup   | Dark background, vibrant accent          |

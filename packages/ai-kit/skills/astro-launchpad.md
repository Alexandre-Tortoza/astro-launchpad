# Astro Launchpad

Use Astro Launchpad's content boundary before changing presentation code.

## Content rules

- Pages are Markdown or MDX files in `src/content/pages` with `title`, optional `seo`, and ordered `sections` frontmatter.
- Supported sections are `hero`, `features`, `cta`, `faq`, `testimonials`, `pricing`, `stats`, `logo_cloud`, and `footer`.
- A section must have a unique `id`, numeric `order`, and a payload accepted by `src/lib/blocks/schemas.ts`.
- Site-wide navigation and default SEO live in `src/content/settings/site.md`.

## Implementation rules

- Keep content-source logic inside a `ContentProvider`; blocks receive payloads and do not fetch content.
- Validate new or changed block payloads with the existing Zod schema pattern before rendering them.
- Prefer a supported section or an extension of the section contract over one-off page markup.
- Preserve semantic HTML and use Astro components for server-rendered content unless client interactivity is required.

## Verification

Run `pnpm build` after template changes. Run `pnpm test` after CLI changes.

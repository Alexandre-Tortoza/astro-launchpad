# Blocks

Blocks are the portable page sections rendered by `SectionRenderer.astro`. A
page stores a small envelope with an `id`, `type`, `order`, and block-specific
`payload`; a Zod schema validates the payload before the component renders.

## Available blocks

| Type           | Use it for                            |
| -------------- | ------------------------------------- |
| `hero`         | Page introduction and primary actions |
| `features`     | A group of capabilities or services   |
| `cta`          | A focused conversion action           |
| `faq`          | Common questions and answers          |
| `testimonials` | Customer or partner quotes            |
| `pricing`      | Plans and offers                      |
| `stats`        | Concise numerical proof points        |
| `logo_cloud`   | Partner or customer logos             |
| `footer`       | Links, social links, and copyright    |

Use the matching payload schema in `src/lib/blocks/schemas.ts` as the source of
truth. Markdown examples live in `src/content/pages/home.md`.

## Add a block

1. Add a payload schema to `src/lib/blocks/schemas.ts`.
2. Add its type and payload interface to `src/types/blocks.ts`.
3. Register the schema in `parseSection` in `src/lib/blocks/validate.ts`.
4. Create `src/components/blocks/YourBlock.astro` with typed props.
5. Import and render it in `src/components/SectionRenderer.astro`.
6. Add the type to the page collection enum in `src/content.config.ts`.
7. Add valid Markdown demo content and, when Directus is used, update the
   Directus schema and seed data with the same payload shape.
8. Run `pnpm check` and `pnpm build` before opening a pull request.

Keep blocks presentational: they receive validated props and do not fetch data
or depend on a specific content provider.

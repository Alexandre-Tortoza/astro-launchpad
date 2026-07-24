# ai-kit

ai-kit provides prompts, agent skills, JSON Schemas, and working examples for
Astro Launchpad content workflows. Add it when creating a project:

```bash
pnpm create astro-launchpad my-site -- --ai-kit
```

The generated project receives these directories at its root:

```txt
prompts/
skills/
schemas/
examples/
```

## Prompts

- `generate-landing.md` creates a complete page frontmatter document.
- `generate-section.md` creates one valid section envelope and payload.
- `rewrite-copy.md` improves copy without changing facts or data shape.
- `seo-review.md` reports on-page SEO issues and concrete corrections.
- `accessibility-review.md` identifies content and component accessibility risks.
- `cms-modeling.md` maps a CMS model to the `ContentProvider` boundary.

## Contracts

`schemas/page.schema.json` describes pages, section envelopes, and every
supported block payload. `site-settings.schema.json` and
`blog-post.schema.json` describe the remaining Astro content collections. They
mirror the validation in `src/content.config.ts` and
`src/lib/blocks/schemas.ts`.

Validate generated content before adding it to `src/content`. The examples are
valid reference data, not product claims to reuse unchanged.

## Skills

The skills explain Launchpad, content modeling, SEO, accessibility, CMS
modeling, and Codex-specific repository practices. Read the relevant skill
before asking an agent to create or review content.

## Responsible agent use

Treat agent output as a proposed change, not proof that a change is correct. Before accepting it, review the relevant diff and surrounding code, run the applicable checks, and confirm that documentation and tests cover user-visible behavior. Do not provide agents with credentials or local configuration, and do not grant permission-bypass flags by default.

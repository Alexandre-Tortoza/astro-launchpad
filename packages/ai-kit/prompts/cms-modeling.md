# CMS Modeling

Design a CMS model that maps cleanly to Astro Launchpad's content-provider boundary.

## Input

- Content editors, workflows, locales, permissions, and publishing needs
- Required page blocks, blog fields, navigation, and shared settings
- CMS platform constraints and existing data sources

## Instructions

1. Model `Page`, `BlogPost`, and `SiteSettings` to match `schemas/page.schema.json`, `schemas/blog-post.schema.json`, and `schemas/site-settings.schema.json`.
2. Store reusable page sections as typed block payloads with `id`, `type`, `order`, and `payload`.
3. Keep source-specific mapping inside a CMS adapter that implements `ContentProvider`; components must not query the CMS directly.
4. Identify required fields, editorial validation, references, locales, drafts, and migration risks.
5. Do not prescribe fields unsupported by the selected CMS without identifying the adapter transformation required.

## Output

Return Markdown with `Content types`, `Fields and validation`, `Relationships`, `Editorial workflow`, and `Adapter mapping` sections. Use `examples/cms-model.json` for the core entity shape.

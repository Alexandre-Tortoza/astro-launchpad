# Generate Section

Create one Astro Launchpad section payload from the supplied brief.

## Input

- Section type
- Section goal and audience
- Available facts, links, imagery, and brand voice

## Instructions

1. Use exactly one supported type from `schemas/page.schema.json`.
2. Return JSON containing `id`, `type`, `order`, and `payload`; do not wrap it in Markdown.
3. Meet all required payload fields for the chosen type.
4. Use a unique, lowercase, hyphenated `id` and preserve the requested `order`.
5. Do not fabricate claims, endorsements, prices, URLs, or image assets. Use `[placeholder]` only where the schema permits a string.
6. Include accessible link labels and non-empty alt text for every image or logo.

## Output

Return only valid JSON. Use `examples/hero-section.json` as a reference.

# SEO Review

Review an Astro Launchpad page for on-page SEO issues without inventing search-performance data.

## Input

- Page frontmatter and rendered-copy context
- Target audience, location if relevant, and target query themes
- Existing canonical, analytics, or Search Console evidence if available

## Instructions

1. Inspect the title, meta description, heading hierarchy, section intent, internal links, image alt text, and CTA labels.
2. Check `seo.title`, `seo.description`, and `seo.ogImage` against `schemas/page.schema.json`.
3. Separate confirmed issues from recommendations that require external data or product decisions.
4. Do not claim rankings, volume, indexing status, or performance results without supplied evidence.
5. Prefer concrete edits that retain accurate claims and fit the existing content model.

## Output

Return Markdown with `Critical`, `Important`, and `Opportunities` sections. Each item must include the affected field or section, the issue, and a proposed correction.

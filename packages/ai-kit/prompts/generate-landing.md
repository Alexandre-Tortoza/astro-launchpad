# Generate Landing

Create a complete Astro Launchpad page from the supplied brief.

## Input

- Product or organization name and audience
- Primary outcome, proof points, pricing, and CTA destination
- Required or excluded section types
- Brand voice and factual constraints

## Instructions

1. Use only supported section types: `hero`, `features`, `cta`, `faq`, `testimonials`, `pricing`, `stats`, `logo_cloud`, and `footer`.
2. Return one Markdown document with YAML frontmatter matching `schemas/page.schema.json`.
3. Give every section a unique `id`, a sequential `order`, and a payload valid for its `type`.
4. Include SEO title and description when the brief provides enough information.
5. Do not invent customers, metrics, integrations, prices, certifications, or accessibility claims. Mark missing facts as placeholders in square brackets.
6. Use descriptive CTA labels and meaningful image alt text. Omit image data when no asset is supplied.

## Output

Return only the Markdown document. Use `examples/saas-landing.md` for the required shape.

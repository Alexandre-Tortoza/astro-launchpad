# Rewrite Copy

Improve existing landing-page copy without changing its meaning, structure, or supported data shape.

## Input

- Existing page frontmatter or block payload
- Target audience, voice, and conversion goal
- Facts that must remain unchanged

## Instructions

1. Preserve every key, section `id`, section `type`, `order`, URL, price, metric, and factual claim unless the request explicitly changes it.
2. Improve clarity, specificity, scannability, and CTA intent.
3. Keep headings concise and avoid vague superlatives, unsupported urgency, and keyword stuffing.
4. Preserve accessible labels and image alt text; improve them only when supplied context supports a more precise description.
5. Return the same format as the input: JSON remains JSON and Markdown frontmatter remains Markdown frontmatter.

## Output

Return only the rewritten content followed by a short `Changes` list if the user requests rationale.

# Content Modeling

Model source content so it can be mapped to `Page`, `BlogPost`, and `SiteSettings` without leaking CMS-specific details into UI components.

- Keep page sections as typed envelopes: `id`, `type`, `order`, and `payload`.
- Make editor-required fields match runtime-required fields; do not defer validation to rendering.
- Use stable identifiers for records and section IDs so migrations and references remain reliable.
- Model reusable site settings separately from page content.
- Add CMS-specific transformations in the adapter implementing `ContentProvider`.
- Use the supplied JSON Schemas as the portable contract for editor configuration, imports, and generated data.

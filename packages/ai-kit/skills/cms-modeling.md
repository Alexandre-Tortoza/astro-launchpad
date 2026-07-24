# CMS Modeling

Use the CMS as a source of validated content, not as a dependency of visual blocks.

- Define page, blog post, and site-settings content types from the supplied schemas.
- Represent sections as discriminated blocks with a section type and matching payload fields.
- Configure field-level required rules and minimum item counts to match the template schemas.
- Define drafts, publishing, permissions, locales, and media ownership explicitly before implementation.
- Map CMS entries to `ContentProvider` types in one adapter layer.
- Document every field that requires a CMS-specific transformation or cannot be represented by the core contract.

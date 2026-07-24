# Local Markdown content

The base template uses Astro content collections for local content. Collection
schemas live in `src/content.config.ts`, so invalid frontmatter fails the Astro
build before it reaches the page renderer.

## Content files

```txt
src/content/
  pages/
    home.md
    about.md
  blog/
    getting-started.md
  settings/
    site.md
```

Filenames become provider slugs. For example, `src/content/pages/about.md` is
available through `getPage('about')`, and
`src/content/blog/getting-started.md` is available through
`getBlogPost('getting-started')`.

## Pages

Page frontmatter includes a title, optional SEO fields, and an ordered list of
section envelopes. `payload` is validated again by `SectionRenderer` before a
block is rendered.

```md
---
title: About
seo:
  title: About our company
sections:
  - id: hero
    type: hero
    order: 1
    payload:
      title: About us
      description: We build useful things.
---
```

Supported section types are `hero`, `features`, `cta`, `faq`,
`testimonials`, `pricing`, `stats`, `logo_cloud`, and `footer`. Refer to the
demo `src/content/pages/home.md` for complete payload examples.

## Blog posts

Blog frontmatter supports `title`, `date`, `excerpt`, `author`, `tags`, and
`coverImage`. The Markdown body is returned as `BlogPost.content`; a later blog
route can render it without changing the provider API.

```md
---
title: A post title
date: 2026-07-24
excerpt: A concise summary.
tags:
  - markdown
---

# Post body
```

## Site settings

`src/content/settings/site.md` supplies the site name, navigation, social links,
and default SEO metadata. It is required because `ContentProvider` always
returns site settings.

To switch to a CMS later, implement `ContentProvider` in a new adapter and
replace the provider import in the route. Components and block payloads do not
need to change.

# Content layer

Astro Launchpad keeps content storage behind the `ContentProvider` interface in
`src/lib/content/types.ts`. Page and route code request typed content from a
provider; visual blocks only receive their payloads and never query content
sources directly.

The base template ships with two providers:

- `MarkdownContentProvider` reads Astro content collections from local Markdown files.
- `MockContentProvider` provides in-memory demo data for isolated tests.

`contentProvider` is the active provider in `src/pages/index.astro` and points
to `markdownProvider` by default. The Directus feature pack replaces that export
with `directusProvider`; page components stay unchanged. Every CMS provider must
implement the same methods:

```ts
interface ContentProvider {
  getPage(slug: string): Promise<Page | null>;
  getPages(): Promise<Page[]>;
  getBlogPost(slug: string): Promise<BlogPost | null>;
  getBlogPosts(): Promise<BlogPost[]>;
  getSiteSettings(): Promise<SiteSettings>;
}
```

The provider owns the mapping from its source format to `Page`, `BlogPost`, and
`SiteSettings`. Keep source-specific imports and data-shaping code there so UI
components stay portable.

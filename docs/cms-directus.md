# Directus CMS

Astro Launchpad ships a `DirectusContentProvider` that implements the same
`ContentProvider` interface as the Markdown provider. Creating a project with
`--cms directus` selects it automatically; no component changes are required.

## Prerequisites

- Docker and Docker Compose (included in the Docker feature pack)
- Node.js 22+

## Quick start

```bash
# 1. Start Directus + PostgreSQL
docker compose up -d

# 2. Install the Directus SDK
npm install @directus/sdk   # or pnpm / yarn / bun

# 3. Apply the schema
npx directus schema apply ./schema/snapshot.json

# 4. Create a static API token (see below), then set env vars
cp .env.example .env
# Edit .env and fill in DIRECTUS_TOKEN

# 5. Seed demo content
npx tsx seed/seed.ts

# 6. Start the dev server
npm run dev
```

## Environment variables

| Variable                  | Description                       | Default                 |
| ------------------------- | --------------------------------- | ----------------------- |
| `DIRECTUS_URL`            | Directus API base URL             | `http://localhost:8055` |
| `DIRECTUS_TOKEN`          | Static API token with read access | _(required)_            |
| `DB_USER`                 | PostgreSQL username               | `directus`              |
| `DB_PASSWORD`             | PostgreSQL password               | `directus`              |
| `DB_DATABASE`             | PostgreSQL database name          | `directus`              |
| `DIRECTUS_SECRET`         | Directus application secret key   | _(set a random string)_ |
| `DIRECTUS_ADMIN_EMAIL`    | Initial admin account email       | `admin@example.com`     |
| `DIRECTUS_ADMIN_PASSWORD` | Initial admin account password    | _(set in .env)_         |

## Creating a static API token

1. Open the Directus admin at http://localhost:8055
2. Log in with your admin credentials
3. Go to **Settings → Access Tokens**
4. Click **Create New** and give the token a name (e.g. `astro-dev`)
5. Set the token's role to **Administrator** (or create a restricted role — see [Roles and permissions](#roles-and-permissions))
6. Copy the token value and set it as `DIRECTUS_TOKEN` in your `.env`

## Wiring up the provider

The feature pack sets `contentProvider` to `directusProvider` in
`src/lib/content/index.ts`. Pages should keep importing `contentProvider`:

```astro
---
// src/pages/index.astro
import { contentProvider } from "../lib/content";
import SectionRenderer from "../components/SectionRenderer.astro";

const page = await contentProvider.getPage("home");
const sections = page?.sections ?? [];
---

<html>
  <head>
    <title>{page?.seo?.title ?? page?.title ?? "My Site"}</title>
  </head>
  <body>
    {sections.map((section) => <SectionRenderer section={section} />)}
  </body>
</html>
```

You can also import `getSiteSettings` for navigation:

```astro
---
const settings = await contentProvider.getSiteSettings();
---

<nav>
  {settings.nav.map((link) => <a href={link.href}>{link.label}</a>)}
</nav>
```

## Schema

The schema snapshot at `schema/snapshot.json` defines 11 collections:

| Collection              | Purpose                                         |
| ----------------------- | ----------------------------------------------- |
| `pages`                 | Site pages; each has slug, title, SEO fields    |
| `sections`              | Ordered content sections belonging to a page    |
| `blog_posts`            | Blog articles with author, categories, and tags |
| `authors`               | Content authors                                 |
| `categories`            | Blog post categories (M2M)                      |
| `tags`                  | Blog post tags (M2M)                            |
| `site_settings`         | Singleton: site name, tagline, default SEO      |
| `navigation_items`      | Header nav links and social links (sorted)      |
| `redirects`             | URL redirects managed by the site               |
| `blog_posts_categories` | M2M junction: blog posts ↔ categories           |
| `blog_posts_tags`       | M2M junction: blog posts ↔ tags                 |

### Section payload

Each `sections` row has a `payload` JSON field containing the block-type-specific content. The payload must match the Zod schema for its `type`. See `src/lib/blocks/schemas.ts` for the exact shapes.

Example — a `hero` section payload:

```json
{
  "title": "Launch editable landing pages at startup speed",
  "eyebrow": "Astro Launchpad",
  "description": "...",
  "primaryCta": {
    "label": "Get started",
    "href": "/docs",
    "variant": "primary"
  }
}
```

## Seed data

`seed/data.json` contains demo content that mirrors the Markdown `home.md` file:

- 1 home page with all 9 block sections
- 2 sample blog posts
- 1 author, 2 categories, 3 tags
- Site settings and navigation items
- 1 sample redirect

Run `npx tsx seed/seed.ts` to insert it. The script uses pre-assigned UUIDs so it is idempotent as long as the data hasn't been partially inserted.

## Roles and permissions

For production, create a restricted Directus role instead of using the admin token:

1. **Settings → Roles & Permissions → Create New Role** (e.g. `astro-read`)
2. Grant **Read** access to: `pages`, `sections`, `blog_posts`, `authors`, `categories`, `tags`, `site_settings`, `navigation_items`, `redirects`, `blog_posts_categories`, `blog_posts_tags`
3. Leave all other permissions as Denied
4. Create a static token for a user with this role

## Redirects

The `redirects` collection is not consumed automatically by `DirectusContentProvider`. To enforce redirects in your Astro site, add middleware that reads from Directus at startup or on each request:

```ts
// src/middleware.ts
import { directusProvider } from "./lib/content";
import { createDirectus, rest, staticToken, readItems } from "@directus/sdk";
// ... fetch active redirects and match against request URL
```

A full example is outside the scope of this guide, but the schema is in place.

## Directus admin tips

- Use **drag-and-drop** to reorder `navigation_items` (the `sort` field is wired to the collection's sort interface)
- The `sections` collection is **hidden** in the admin sidebar — manage sections from the page form via the inline O2M interface
- Junction collections (`blog_posts_tags`, `blog_posts_categories`) are also hidden; manage tags and categories from the blog post form
- Use the **status** field on pages and blog posts to control what the `DirectusContentProvider` returns (only `published` items are fetched)

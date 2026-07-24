# Directus CMS

Selecting `--cms directus` creates an Astro SSR project, PostgreSQL, Directus,
a schema snapshot, seed data, and local credentials in the ignored `.env` file.
No manual access-token creation is required for local development.

## Quick start

```bash
pnpm cms:setup
pnpm docker:dev
```

Open `http://localhost:8055` and sign in with the generated values from `.env`.
The Astro site uses the internal Docker address for Directus, so `DIRECTUS_URL`
is never exposed to browser code.

`cms:setup` starts the CMS dependencies, waits for health, applies
`schema/snapshot.json`, configures a static server token, and runs the seed. The
seed verifies system permissions before it changes content and reports a clear
error when an administrator policy must be repaired.

## Environment

Local credentials are generated for every Directus project. Do not commit
`.env`. For production, set these values through the host or secret manager:

| Variable                  | Purpose                                      |
| ------------------------- | -------------------------------------------- |
| `PUBLIC_SITE_URL`         | Public HTTPS URL used during the Astro build |
| `DIRECTUS_PUBLIC_URL`     | Public CMS URL behind its TLS proxy          |
| `DIRECTUS_SECRET`         | Unique Directus application secret           |
| `DIRECTUS_ADMIN_EMAIL`    | Initial administrator email                  |
| `DIRECTUS_ADMIN_PASSWORD` | Initial administrator password               |
| `DB_PASSWORD`             | Unique PostgreSQL password                   |
| `DIRECTUS_TOKEN`          | Server-only token used by Astro SSR          |

## Content model

The snapshot creates pages, sections, site settings, navigation, blog posts,
authors, categories, tags, and redirects. Section payloads are JSON validated
against `src/lib/blocks/schemas.ts`; publish only content that satisfies the
matching block schema.

The application queries only published pages and posts. Directus content edits
are rendered by SSR on subsequent requests. The token belongs exclusively in
server-side configuration: never prefix it with `PUBLIC_`.

## Production

Use `compose.prod.yml` on a VPS or build the generated Dockerfile for a
container platform. Configure Directus CORS, TLS, upload storage, database
backups, and secret rotation before handing the project to a client. The bundled
administrator token is appropriate for initial setup only; replace it with a
restricted read-only service account before a public launch.

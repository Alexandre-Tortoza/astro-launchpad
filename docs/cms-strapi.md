# Strapi CMS

Selecting `--cms strapi` creates an Astro SSR project, a complete Strapi 5
TypeScript app under `cms/`, PostgreSQL, and local credentials in the ignored
`.env` file. No manual setup is required for local development.

## Quick start

```bash
pnpm docker:dev
```

On first start, Strapi builds its admin UI, bootstraps the database, creates the
admin user, provisions a read-only API token, grants public read permissions, and
seeds the demo content. This takes about 2–3 minutes. Progress is visible via:

```bash
docker compose logs -f strapi
```

Open `http://localhost:1337/admin` and sign in with the credentials from `.env`
(`STRAPI_ADMIN_EMAIL` and `STRAPI_ADMIN_PASSWORD`). The Astro site connects to
Strapi via the internal Docker address and the `STRAPI_TOKEN` bearer token.

## Environment

Local credentials are generated for every Strapi project. Do not commit `.env`.
For production, set these values through the host or secret manager:

| Variable                | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| `PUBLIC_SITE_URL`       | Public HTTPS URL used during the Astro build     |
| `APP_KEYS`              | Comma-separated Strapi application keys (4 keys) |
| `API_TOKEN_SALT`        | Salt used to hash API tokens                     |
| `ADMIN_JWT_SECRET`      | JWT secret for admin authentication              |
| `TRANSFER_TOKEN_SALT`   | Salt for data transfer tokens                    |
| `JWT_SECRET`            | JWT secret for users-permissions plugin          |
| `ENCRYPTION_KEY`        | Encryption key for sensitive fields              |
| `DB_PASSWORD`           | Unique PostgreSQL password                       |
| `STRAPI_ADMIN_EMAIL`    | Initial administrator email                      |
| `STRAPI_ADMIN_PASSWORD` | Initial administrator password                   |
| `STRAPI_TOKEN`          | Server-only token used by Astro SSR              |

## Content model

The Strapi app defines: `page` (with repeatable `shared.section` component),
`blog-post` (with `author` relation, `tags`/`categories` many-to-many),
`author`, `category`, `tag`, `navigation-item`, `redirect`, and `site-setting`
(single type). Section payloads are JSON validated against
`src/lib/blocks/schemas.ts`; publish only content that satisfies the matching
block schema.

The bootstrap in `cms/src/index.ts` is idempotent — running `docker compose up`
on an already-initialized database is safe and skips all provisioning steps.

The application uses a read-only bearer token. Never prefix `STRAPI_TOKEN` with
`PUBLIC_` — it must stay server-side only.

## Token mechanism

The API token is stored as an HMAC-SHA512 hash of the plain-text token:

```
accessKey = HMAC-SHA512(SHA256(API_TOKEN_SALT), STRAPI_TOKEN)
```

The plain `STRAPI_TOKEN` in `.env` is what Astro uses as the Bearer token.
Strapi verifies it by recomputing the hash on every request.

## Production

Use `compose.prod.yml` on a VPS or build `cms/Dockerfile` for a container
platform. In production, Strapi builds the admin UI at image build time and
serves only the API at runtime. Configure CORS, TLS, upload storage, database
backups, and secret rotation before handing the project to a client.

Strapi's admin password policy requires at least one uppercase letter, one
lowercase letter, and one digit. The generated password satisfies this with an
`Aa1-` prefix.

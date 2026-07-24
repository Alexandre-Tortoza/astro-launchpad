# Docker

Projects created with Docker include two isolated environments:

- `compose.yml` and `compose.dev.yml` run the development environment with Astro hot reload.
- `compose.prod.yml` builds the optimized production image without source mounts.

The generated Dockerfile is materialized for the selected package manager. npm,
pnpm, Yarn, and Bun therefore use their own lockfile and deterministic install
command in Docker.

## Development

```bash
# `compose.yml` is the development default
docker compose up --build

# equivalent package command
pnpm docker:dev
```

The site is available at `http://localhost:4321` unless `PORT` is set. Source
files are mounted into the container and Astro updates the browser on changes.

With Directus selected, this command also starts PostgreSQL and Directus. The
schema, Directus 11 policy repair, server token, and idempotent demo seed run as
Compose initialization jobs before the Astro server starts. No separate CMS
command is required.

## Production

```bash
docker compose -f compose.prod.yml up -d --build
# or: pnpm docker:prod
```

For Markdown projects, production uses a small nginx image containing only the
static `dist/` output. Directus projects run Astro as an SSR Node service, so
CMS edits are visible on the next request without a site rebuild.

`PUBLIC_SITE_URL` is a build-time value. Set it to the real HTTPS site URL in
the production environment before building; it controls canonical URLs and the
sitemap. Directus production configuration also requires unique database,
application, and administrator secrets. The production Compose file binds the
Directus admin port to localhost; put a TLS reverse proxy in front of any public
service.

## Reset local CMS state

```bash
docker compose down -v
docker compose up --build
```

Never use `down -v` against a production project: it removes the PostgreSQL and
upload volumes.

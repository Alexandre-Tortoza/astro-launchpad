# Docker

Astro Launchpad ships optional Docker support for local development and self-hosted deployments. Docker is never required — `pnpm dev` and `pnpm build` always work without it.

## Without CMS (static site)

The `docker` feature pack adds a Dockerfile and a minimal `docker-compose.yml` for the built static site served by nginx.

```bash
# Build and start the container
docker compose up --build

# Stop containers
docker compose down
```

The site is served at `http://localhost:3000` by default. Change the port with `PORT=8080 docker compose up`.

**nginx is used as the static file server** because Astro's static output is a plain directory of HTML, CSS, and JS — no Node.js runtime needed at serve time.

## With Directus CMS

When the Directus feature pack is applied, the `docker-compose.yml` includes three services:

```
web       — your Astro site (nginx)
directus  — Directus headless CMS
postgres  — PostgreSQL database
```

```bash
# Copy the example env file
cp .env.example .env
# Edit .env with your secrets

# Start all services
docker compose up

# Access CMS
open http://localhost:8055
```

## Environment variables

Copy `.env.example` to `.env` and fill in the values. Never commit `.env` to version control — it is already in `.gitignore`.

| Variable   | Default               | Description                                |
| ---------- | --------------------- | ------------------------------------------ |
| `SITE_URL` | `https://example.com` | Public URL for canonical links and sitemap |
| `PORT`     | `3000`                | Local port for the web container           |

When Directus is included, additional variables for the database and CMS admin are added to `.env.example`.

## Reset local state

```bash
# Stop containers and remove volumes (resets the database)
docker compose down -v

# Rebuild images from scratch
docker compose up --build --force-recreate
```

## Production

For production deployment, prefer a platform that builds the Astro site as a static artifact (Netlify, Vercel, Cloudflare Pages, S3 + CloudFront). Docker is primarily designed for local dev and self-hosted setups.

See [deployment.md](./deployment.md) for platform-specific instructions.

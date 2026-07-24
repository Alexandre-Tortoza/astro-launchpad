# Deployment

## Environment

Copy `.env.example` to `.env` and set `PUBLIC_SITE_URL` to the deployed site's
canonical URL. `PUBLIC_SITE_NAME` supplies a fallback name when the content
provider has no site settings. Values prefixed with `PUBLIC_` are available to
browser code, so never put tokens or credentials in them.

The Directus feature adds its own `.env.example`; set `DIRECTUS_TOKEN` only in
server-side environment configuration. `PREVIEW_TOKEN`, `PUBLIC_GA_ID`, and
`PUBLIC_PLAUSIBLE_DOMAIN` are optional placeholders for integrations you add.

## Static site hosting

Build the site with `pnpm build` and deploy `dist/`. Vercel, Netlify,
Cloudflare Pages, and any static host support this output. Configure the build
command as `pnpm build`, the output directory as `dist`, and set
`PUBLIC_SITE_URL` to the production URL.

For preview deployments, set the preview URL as `PUBLIC_SITE_URL` for that
environment so canonical URLs and the sitemap stay accurate. Docker static
builds receive this value as a build argument; runtime environment variables
cannot change an already generated sitemap.

## Directus and PostgreSQL

Directus projects are SSR applications. Compose initializes a new database, then
use `docker compose -f compose.prod.yml up -d --build` on a VPS, or publish the
same Dockerfile to a container platform. In production, use a managed
PostgreSQL database where possible.

Set `DIRECTUS_URL` to the CMS API URL and keep `DIRECTUS_TOKEN`, database
passwords, and `DIRECTUS_SECRET` in the host's secret manager. Restrict Directus
CORS to your deployed site URL and create regular database and upload backups.

## Deployment checklist

1. Set production environment variables and secrets.
2. Run `pnpm check` and `pnpm launch:check`.
3. Configure the domain, HTTPS, `PUBLIC_SITE_URL`, and CMS CORS origins.
4. Start `compose.prod.yml` once to initialize a new Directus database, then
   replace its initial administrator token with a restricted read-only service
   token.
5. Verify pages, forms, sitemap, robots file, and social metadata.
6. Confirm CMS backups and credential rotation ownership before handoff.

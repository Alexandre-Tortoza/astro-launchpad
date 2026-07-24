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
environment so canonical URLs and the sitemap stay accurate.

## Directus and PostgreSQL

For local development, the Directus feature provides `docker compose up` with
PostgreSQL. In production, use Directus Cloud, Railway, Render, Fly.io, or a
VPS running Docker with a managed PostgreSQL database where possible.

Set `DIRECTUS_URL` to the CMS API URL and keep `DIRECTUS_TOKEN`, database
passwords, and `DIRECTUS_SECRET` in the host's secret manager. Restrict Directus
CORS to your deployed site URL and create regular database and upload backups.

## Deployment checklist

1. Set production environment variables and secrets.
2. Run `pnpm check` and `pnpm build`.
3. Configure the domain, HTTPS, `PUBLIC_SITE_URL`, and CMS CORS origins.
4. Apply the Directus schema and seed content when the CMS is new.
5. Verify pages, forms, sitemap, robots file, and social metadata.
6. Confirm CMS backups and credential rotation ownership before handoff.

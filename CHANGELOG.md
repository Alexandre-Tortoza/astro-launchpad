# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

## [0.0.2] - 2026-07-25

### Fixed

- CLI now works when run via `npm create` or `npx` without a pre-installed `node_modules`. The build now bundles `@clack/prompts` into a single self-contained `dist/index.js` using esbuild instead of plain TypeScript compilation.

## [0.0.1] - 2026-07-25

### Added

- `create-astro-launchpad` CLI: interactive and non-interactive project scaffolding with `--preset`, `--cms`, `--tailwind`, `--blog`, `--motion`, `--docker`, `--ai-kit`, `--package-manager`, and `--yes` flags.
- Seven content presets: `minimal`, `saas`, `agency`, `local-business`, `portfolio`, `waitlist`, and `event`.
- Base Astro template with TypeScript, Zod 4 validation, and nine reusable landing-page blocks: Hero, Features, CTA, FAQ, Testimonials, Pricing, Stats, LogoCloud, and Footer.
- Markdown content provider with demo content per preset.
- **Directus 12** CMS option (`--cms directus`): fully automated Docker stack that applies the schema, provisions a read-only token, and seeds content on first `docker compose up`.
- **Strapi 5** CMS option (`--cms strapi`): complete Strapi TypeScript app under `cms/` with all content types, idempotent bootstrap (admin, API token, public permissions, seed data), and pure-fetch content provider.
- Docker support (`--docker`): multi-stage Dockerfile, `compose.yml`, `compose.dev.yml`, and `compose.prod.yml` targeting Node 24, nginx 1.31, and PostgreSQL 17.
- `launchpad:doctor` command to validate CMS connectivity and environment variables.
- Motion feature pack (`--motion`): CSS-only Fade/Slide/Scale components.
- Blog feature pack (`--blog`): RSS feed and paginated listing wired to the active content provider.
- `ai-kit` feature pack (`--ai-kit`): prompts, skill files, JSON schemas, and copy examples.
- Automated release workflow: GitHub Actions publishes the tested artifact to npm on version tag push.
- `pnpm audit`, `pnpm pack:check`, and `pnpm build:examples` scripts.

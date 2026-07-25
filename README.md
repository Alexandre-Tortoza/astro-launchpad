# Astro Launchpad

**Launch editable Astro landing pages at startup speed.**

Astro Launchpad helps freelancers, small agencies, and startup teams launch editable Astro landing pages without rebuilding the same project foundation for every site.

> Status: `v0.0.1` — CLI, seven presets, Markdown/Directus 12/Strapi 5, Docker,
> blog, motion, and ai-kit are all shipped and tested.

## Requirements

- Node.js 22 or later
- npm, or pnpm 11 or later

Git is optional. The CLI can initialize a repository when Git is available, or you can pass `--no-git`.

## Compatibility

The CLI is continuously tested on Node.js 22 and 24 with Linux, macOS, and Windows. It supports Node.js 22 or later.

## Quick start

```bash
pnpm create astro-launchpad my-site
cd my-site
pnpm dev
```

With npm:

```bash
npm create astro-launchpad@latest my-site
```

The CLI copies the base template, normalizes its package name, writes `astro-launchpad.json`, and can install dependencies and initialize Git.

For a Docker-backed CMS project, select Directus or Strapi during the prompts, then run:

```bash
pnpm docker:dev
```

This starts a hot-reloading Astro container, the CMS, and PostgreSQL. For
Directus, Compose automatically applies the schema and seeds the CMS. For
Strapi, the app bootstraps the admin user, API token, permissions, and seed
content on first start. Production uses the separately optimized `compose.prod.yml` stack.

## What's included

- Astro base template with TypeScript and Zod 4 validation
- Nine reusable landing-page blocks: Hero, Features, CTA, FAQ, Testimonials, Pricing, Stats, LogoCloud, and Footer
- Seven content presets: minimal, saas, agency, local-business, portfolio, waitlist, event
- Interactive and non-interactive project scaffolding
- Content providers: Markdown (static), Directus 12 (Docker), Strapi 5 (Docker)
- Optional Tailwind CSS, Blog (RSS + listing), Motion (CSS-only animations), Docker, and ai-kit feature packs
- `launchpad:doctor` environment and CMS connectivity checker
- `--help`, `--version`, `--yes`, `--skip-install`, and `--no-git` CLI controls

### CMS feature matrix

| Feature                    | Markdown | Directus 12 | Strapi 5    |
| -------------------------- | -------- | ----------- | ----------- |
| Pages with sections        | ✓        | ✓           | ✓           |
| Blog posts                 | ✓        | ✓           | ✓           |
| Site settings              | ✓        | ✓           | ✓           |
| Navigation items           | —        | ✓           | ✓           |
| Docker compose stack       | —        | ✓           | ✓           |
| Admin UI                   | —        | :8055/admin | :1337/admin |
| Auto-seeded on first start | —        | ✓           | ✓           |

## Troubleshooting

- **Node version error:** run `node --version` and upgrade to Node.js 22 or later.
- **Destination is not empty:** choose a new directory, or remove the existing files yourself. The CLI never overwrites a non-empty directory.
- **Skip setup commands:** add `--skip-install --no-git` to create files without installing dependencies or initializing Git.
- **Need all options:** run `npm create astro-launchpad@latest -- --help`, or read the [CLI reference](./docs/cli.md).
- **Undo a generated project:** remove its directory. The CLI does not modify files outside the selected destination.

## Documentation

Read [Getting started](./docs/getting-started.md), [CLI usage](./docs/cli.md),
[blocks](./docs/blocks.md), [content](./docs/content-layer.md),
[Markdown](./docs/cms-markdown.md), [Directus](./docs/cms-directus.md),
[Strapi](./docs/cms-strapi.md), [Docker](./docs/docker.md),
[deployment](./docs/deployment.md), [client editing](./docs/client-guide.md),
[ai-kit](./docs/ai.md), [architecture](./docs/architecture.md),
[security](./docs/security.md), and [development](./docs/development.md).

## Roadmap

See [ROADMAP.md](./ROADMAP.md).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

AGPL-3.0-only. See [LICENSE](./LICENSE).

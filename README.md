# Astro Launchpad

**Launch production-ready Astro landing pages without rebuilding the same foundation every time.**

Astro Launchpad is an interactive CLI for freelancers, agencies, and startup teams
that need fast, editable, and deployable landing pages.

## Quick start

```bash
npm create astro-launchpad@latest my-site
cd my-site
npm run dev
```

Using pnpm:

```bash
pnpm create astro-launchpad my-site
cd my-site
pnpm dev
```

## What the CLI generates

The CLI asks you to choose:

- A landing-page preset
- A content provider: Markdown, Directus, or Strapi
- Tailwind CSS
- Blog support with RSS
- Motion effects
- Docker environments
- AI development resources

It then generates a complete, runnable project with your selections applied,
optionally installs dependencies, and initializes Git.

## What can you build?

- SaaS product pages
- Agency and studio websites
- Local business websites
- Portfolios
- Product waitlists
- Event pages
- Custom landing pages

## Choose how content is managed

### Markdown

Best for static sites managed by developers. Content lives in `.md` files alongside
the code. No database or Docker required.

### Directus

Best for projects where clients need a visual admin interface to edit pages,
navigation, settings, and blog posts. Runs locally with Docker and seeds example
content automatically on first start.

### Strapi

Best for teams that prefer a structured headless CMS with a customizable content
administration experience. Runs locally with Docker and bootstraps the full schema,
permissions, and seed data on first start.

| Feature                    | Markdown | Directus 12 | Strapi 5    |
| -------------------------- | -------- | ----------- | ----------- |
| Pages with sections        | ✓        | ✓           | ✓           |
| Blog posts                 | ✓        | ✓           | ✓           |
| Site settings              | ✓        | ✓           | ✓           |
| Navigation items           | —        | ✓           | ✓           |
| Docker compose stack       | —        | ✓           | ✓           |
| Admin UI                   | —        | :8055/admin | :1337/admin |
| Auto-seeded on first start | —        | ✓           | ✓           |

## Start with Docker

When Directus or Strapi is selected, one command starts the full stack:

```bash
pnpm docker:dev
```

This starts Astro, the selected CMS, and PostgreSQL with hot reloading.
On first boot, the CMS applies its schema, creates the admin user, provisions
the API token, and seeds example content automatically.

Production uses the separately optimized `compose.prod.yml` stack.

## What you get

- A complete landing page ready to customize
- Nine reusable sections: Hero, Features, CTA, FAQ, Testimonials, Pricing, Stats, LogoCloud, and Footer
- Seven starting presets: minimal, saas, agency, local-business, portfolio, waitlist, event
- Optional visual CMS with Directus or Strapi
- Development and production Docker environments
- Blog pages with RSS feed
- Environment and CMS connectivity diagnostics (`launchpad:doctor`)
- AI prompts, skills, and JSON schemas for content and code workflows

## Requirements

- Node.js 22 or later
- npm, or pnpm 11 or later

Git is optional. The CLI can initialize a repository when Git is available, or
you can pass `--no-git`.

The CLI is continuously tested on Linux, macOS, and Windows with Node.js 22 and 24.

## Troubleshooting

- **Node version error:** run `node --version` and upgrade to Node.js 22 or later.
- **Destination is not empty:** choose a new directory, or remove the existing files yourself. The CLI never overwrites a non-empty directory.
- **Skip setup commands:** add `--skip-install --no-git` to create files without installing dependencies or initializing Git.
- **Need all options:** run `npm create astro-launchpad@latest my-site -- --help`, or read the [CLI reference](./docs/cli.md).
- **Undo a generated project:** remove its directory. The CLI does not modify files outside the selected destination.

## Documentation

### Using Astro Launchpad

- [Getting started](./docs/getting-started.md)
- [CLI reference](./docs/cli.md)
- [Available blocks](./docs/blocks.md)
- [Content layer](./docs/content-layer.md)
- [Docker](./docs/docker.md)
- [Deployment](./docs/deployment.md)
- [Client editing guide](./docs/client-guide.md)

### Content providers

- [Markdown](./docs/cms-markdown.md)
- [Directus](./docs/cms-directus.md)
- [Strapi](./docs/cms-strapi.md)

### Project

- [Architecture](./docs/architecture.md)
- [Security](./docs/security.md)
- [Development](./docs/development.md)
- [AI kit](./docs/ai.md)

## Project status

Astro Launchpad is under active development and tested on Linux, macOS, and Windows
with Node.js 22 and 24. See [CHANGELOG.md](./CHANGELOG.md) for released features.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening
a pull request.

## Roadmap

See [ROADMAP.md](./ROADMAP.md).

## License

AGPL-3.0-only. See [LICENSE](./LICENSE).

# Astro Launchpad

**Launch editable Astro landing pages at startup speed.**

Astro Launchpad helps freelancers, small agencies, and startup teams launch editable Astro landing pages without rebuilding the same project foundation for every site.

> Status: `0.0.x` foundation. The base template, six content presets, and
> scaffolding CLI are ready for experimentation. Optional features are supported
> only where the CLI reference explicitly says they are applied.

## Requirements

- Node.js 22 or later
- npm, or pnpm 11.3.0 or later

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

For a Docker-backed CMS project, select Directus during the prompts, then run:

```bash
pnpm docker:dev
```

This starts a hot-reloading Astro container, Directus, and PostgreSQL. Compose
automatically applies the schema, repairs Directus access, creates the local
server token, and seeds the CMS. Production uses the separately optimized
`compose.prod.yml` stack.

## What's included

- Astro base template with TypeScript and Zod validation
- Reusable landing-page blocks: Hero, Features, CTA, FAQ, Testimonials, Pricing, Stats, LogoCloud, and Footer
- Interactive and non-interactive project scaffolding
- Optional ai-kit prompts, skills, JSON Schemas, and examples via `--ai-kit`
- `--help`, `--version`, `--yes`, `--skip-install`, and `--no-git` CLI controls

## Troubleshooting

- **Node version error:** run `node --version` and upgrade to Node.js 22 or later.
- **Destination is not empty:** choose a new directory, or remove the existing files yourself. The CLI never overwrites a non-empty directory.
- **Skip setup commands:** add `--skip-install --no-git` to create files without installing dependencies or initializing Git.
- **Need all options:** run `npm create astro-launchpad@latest -- --help`, or read the [CLI reference](./docs/cli.md).
- **Undo a generated project:** remove its directory. The CLI does not modify files outside the selected destination.

## Current limitations

All six presets are applied as template overlays with Markdown demo content and
local placeholder images. Tailwind, Blog, Motion, Docker, ai-kit, and Directus
are applied when selected. SaaS and Agency can use the Directus content provider.

## Documentation

Read [Getting started](./docs/getting-started.md), [CLI usage](./docs/cli.md),
[blocks](./docs/blocks.md), [content](./docs/content-layer.md),
[Markdown](./docs/cms-markdown.md), [Directus](./docs/cms-directus.md),
[Docker](./docs/docker.md), [deployment](./docs/deployment.md),
[client editing](./docs/client-guide.md), [ai-kit](./docs/ai.md),
[architecture](./docs/architecture.md), [security](./docs/security.md), and
[development](./docs/development.md).

## Roadmap

See [ROADMAP.md](./ROADMAP.md).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

AGPL-3.0-only. See [LICENSE](./LICENSE).

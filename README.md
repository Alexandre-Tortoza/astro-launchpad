# Astro Launchpad

**Launch editable Astro landing pages at startup speed.**

Astro Launchpad is an experimental open source starter and CLI for creating editable Astro landing pages with reusable blocks and a reproducible local setup.

> Status: `0.0.x` foundation. The base template and scaffolding CLI are ready for experimentation. ai-kit is available as a scaffolded feature; presets and remaining feature selections are recorded as configuration.

## Quick start

```bash
pnpm create astro-launchpad my-site
cd my-site
pnpm dev
```

Or with npm:

```bash
npm create astro-launchpad@latest my-site
```

The CLI copies the base template, normalizes its package name, writes `astro-launchpad.json`, and can install dependencies and initialize Git.

## What's included

- Astro base template with TypeScript and Zod validation
- Reusable landing-page blocks: Hero, Features, CTA, FAQ, Testimonials, Pricing, Stats, LogoCloud, and Footer
- Interactive and non-interactive project scaffolding
- Optional ai-kit prompts, skills, JSON Schemas, and examples via `--ai-kit`
- `--help`, `--version`, `--yes`, `--skip-install`, and `--no-git` CLI controls

## Current limitations

The CLI accepts preset and feature selections so projects can retain their intended configuration. In `0.0.x`, ai-kit is the supported scaffolded feature. Other selected features do not yet have a supported end-to-end workflow, even when experimental files are present.

## Documentation

Read [Getting started](./docs/getting-started.md), [CLI usage](./docs/cli.md), [ai-kit](./docs/ai.md), [architecture](./docs/architecture.md), and [development](./docs/development.md).

## Roadmap

See [ROADMAP.md](./ROADMAP.md).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

AGPL-3.0-only. See [LICENSE](./LICENSE).

# Astro Launchpad

**Launch editable Astro landing pages at startup speed.**

Astro Launchpad is an experimental open source starter and CLI for creating editable Astro landing pages with reusable blocks and a reproducible local setup.

> Status: `0.0.x` foundation. The base template and scaffolding CLI are ready for experimentation; presets and feature packs are recorded as configuration only and are not installed yet.

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
- `--help`, `--version`, `--yes`, `--skip-install`, and `--no-git` CLI controls

## Current limitations

The CLI accepts preset and feature selections so projects can retain their intended configuration. In `0.0.x`, selected features do not have a supported end-to-end workflow. Experimental scaffold files may be present while a feature is being developed, but they are not compatibility commitments until documented for `0.1.0`.

## Documentation

Read [Getting started](./docs/getting-started.md), [CLI usage](./docs/cli.md), [architecture](./docs/architecture.md), and [development](./docs/development.md).

## Roadmap

See [ROADMAP.md](./ROADMAP.md).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

AGPL-3.0-only. See [LICENSE](./LICENSE).

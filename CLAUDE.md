# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

`astro-launchpad` is a CLI scaffolding tool (`create-astro-launchpad`) that generates Astro projects with configurable presets, CMS integrations, and feature packs. It is a pnpm monorepo.

## Common Commands

```bash
# Root workspace
pnpm dev                  # Start the base template dev server (localhost:4321)
pnpm build                # Build all packages + presets + examples
pnpm build:presets        # Compile preset overlays only
pnpm build:examples       # Regenerate reference examples
pnpm check                # Full verification: format + lint + typecheck + test

# Individual checks
pnpm format               # Prettier (check only)
pnpm lint                 # ESLint
pnpm typecheck            # tsc across all packages

# Testing
pnpm test                 # Vitest (unit + integration)
pnpm test:watch           # Vitest watch mode
pnpm test:integration     # Integration tests only (scaffolds real projects)

# Packaging
pnpm pack:check           # Validate tarball before publish
```

Tests live in `packages/create-astro-launchpad/test/`. To run a single test file:

```bash
pnpm --filter create-astro-launchpad exec vitest run test/options.test.ts
```

## Architecture

### Monorepo Layout

```
packages/
  create-astro-launchpad/   # Published CLI — the main product
  ai-kit/                   # AI prompt templates, skill files, JSON schemas
  cms-adapters/             # CMS provider interfaces (markdown, directus)
  launchpad-core/           # Content layer abstractions (minimal in v0.0.1)
  ui/                       # Shared UI components
templates/
  base/                     # Base Astro project template (copied to every new project)
  features/                 # Feature packs: blog, tailwind, directus, strapi, docker, motion, ai-kit
  presets/                  # Content overlays: minimal, saas, agency, portfolio, etc.
scripts/                    # Build automation (build-presets.mjs, build-examples.mjs, pack-check.mjs)
docs/                       # End-user documentation
examples/                   # Reference generated projects
```

### CLI Scaffold Flow (`packages/create-astro-launchpad/src/`)

The CLI entry point (`index.ts`) coordinates these steps via `scaffold.ts`:

1. **Validate** the target directory is empty
2. **Copy** `templates/base` verbatim (excluding `node_modules`, `.astro`, `dist`)
3. **Merge** `package.json` — feature packs inject dependencies via `mergePackPackageJson()`
4. **Write** `astro-launchpad.json` manifest recording the chosen preset + features
5. **Apply overlays** in order: preset → feature packs (tailwind, blog, motion, docker, ai-kit) → CMS adapter
6. **Generate** `.env` with random secrets
7. **Generate** `astro.config.mjs` (only when an SSR CMS is selected)
8. **Generate** Docker Compose files (`docker.ts`) when Docker or a server-side CMS is enabled
9. **Install** dependencies and **init** git (both optional)

Key source files:

- `src/types.ts` — `Preset`, `Cms`, `ProjectOptions`, `LaunchpadManifest` type definitions
- `src/options.ts` — CLI flag parsing, `helpText`, `parseCliArguments`
- `src/prompts.ts` — Interactive prompts via `@clack/prompts`
- `src/scaffold.ts` — Core scaffolding logic
- `src/doctor.ts` — `doctor` subcommand: checks Node version, Docker, env vars, CMS connectivity
- `src/docker.ts` — Docker Compose generation for Directus/Strapi

### Base Template (`templates/base/src/`)

The template uses a **block-based content architecture**:

- `lib/blocks/schemas.ts` — Zod schemas for every block type (Hero, Features, CTA, etc.)
- `lib/content/` — Content providers: `markdown.ts` (static files), `mock.ts` (test fixtures)
- `components/blocks/` — One Astro component per block type
- `components/SectionRenderer.astro` — Dispatches blocks to the right component
- `content.config.ts` — Astro content collection definitions
- Pages are Markdown files in `src/content/pages/` that list block configurations

### CMS Adapters (`packages/cms-adapters/`)

Exports a shared interface plus two provider implementations (markdown, directus). Strapi is added as a feature pack overlay in `templates/features/strapi/`.

## Presets and Features

**7 presets** (content overlays): `minimal`, `saas`, `agency`, `local-business`, `portfolio`, `waitlist`, `event`

**Feature packs** (additive overlays under `templates/features/`): `tailwind`, `blog`, `directus`, `strapi`, `docker`, `motion`, `ai-kit`

Each feature pack can supply: additional source files, extra `package.json` deps, and `.env.example` additions that get merged during scaffolding.

## Tooling

- **Formatter**: Prettier with `prettier-plugin-astro`
- **Linter**: ESLint flat config (`eslint.config.mjs`) with `typescript-eslint` and Node.js globals
- **Tests**: Vitest
- **Commits**: Conventional commits enforced by commitlint + husky
- **Package manager**: pnpm ≥ 11 required; Node ≥ 22 required
- **Monorepo filter**: use `pnpm --filter <package-name> <cmd>` to scope commands to one package

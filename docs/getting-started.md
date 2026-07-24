# Getting Started

Astro Launchpad requires Node.js 22 or later. The generated project supports pnpm, npm, Yarn, and Bun; pnpm is the default.

## Create a project

```bash
npm create astro-launchpad@latest my-site
cd my-site
npm run dev
```

You can also use pnpm:

```bash
pnpm create astro-launchpad my-site
```

## Non-interactive use

Use `--yes` to accept defaults. Add `--skip-install` or `--no-git` when your environment manages those steps itself.

```bash
npm create astro-launchpad@latest my-site -- --yes --skip-install --no-git
```

The `0.0.x` CLI copies the base template and saves selected presets and features
to `astro-launchpad.json`. Add `--ai-kit` to install ai-kit prompts, skills,
schemas, and examples in the generated project. Other selected feature packs
remain configuration-only; see the [roadmap](../ROADMAP.md).

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

The CLI applies the selected preset's Markdown demo content and local SVG assets
over the base template, then saves the selections to `astro-launchpad.json`.
Add `--ai-kit` to install ai-kit prompts, skills, schemas, and examples. See the
[CLI reference](./cli.md) for preset details and Directus support.

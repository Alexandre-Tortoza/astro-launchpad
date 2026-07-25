# Repository Guide

## Toolchain and verification

- Use Node.js 22+ and the pinned pnpm 11.17.0; install with `pnpm install --frozen-lockfile`.
- `pnpm check` runs format checking, ESLint, targeted type checks, and CLI tests. It does **not** build every workspace or preset; use `pnpm build` for template, ai-kit, CLI, and preset-build verification.
- CI runs `pnpm check`, `pnpm build`, `pnpm audit`, `pnpm pack:check`, then requires `git diff --exit-code`. Run `pnpm pack:check` for changes to the published CLI package or the assets it embeds.
- Run CLI tests with `pnpm --filter create-astro-launchpad test`. The package test builds first; integration tests invoke `packages/create-astro-launchpad/dist/index.js` in self-cleaning temporary directories.
- `pnpm dev` starts `templates/base`. For generated-project behavior, build the CLI first, then exercise `packages/create-astro-launchpad/dist/index.js` or its tests.

## Project boundaries

- `templates/base` is the source Astro project. `packages/create-astro-launchpad` is the published CLI; its build copies the base template, all feature packs and presets, and ai-kit assets into `dist/template/`. Change source assets, never the generated `dist/` copy.
- Scaffold order is base template, preset overlay, then selected feature overlays. Package dependencies/scripts are merged from Tailwind, blog, and CMS packs before overlays. Keep overlapping assets and manifests coherent across those layers.
- The base template keeps content access behind `src/lib/content/types.ts`; blocks receive validated payloads and must not fetch from a provider directly. CMS-specific mapping belongs in the provider.
- A new block requires schema/type/validation registration, a component plus `SectionRenderer.astro` registration, content-collection enum entry, and valid Markdown demo content. Directus-compatible blocks also require matching Directus schema and seed-data updates.

## CLI and workflow constraints

- CLI changes must preserve both interactive prompts and the `--yes` flow unless an intentional limitation is documented. Test observable behavior through the compiled executable; keep integration fixtures self-contained and clean up temporary directories.
- Husky runs lint-staged before commits and `pnpm check` before pushes. Commit messages use Conventional Commit types limited to `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, and `test`; releases derive version bumps from these messages.

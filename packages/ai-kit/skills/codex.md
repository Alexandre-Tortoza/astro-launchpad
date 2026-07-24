# Codex

Work in small, verifiable changes that preserve Astro Launchpad's boundaries.

## Before editing

- Inspect the relevant template, feature pack, CLI code, and tests before choosing an implementation.
- Treat `templates/base` as the source for generated applications and `packages/create-astro-launchpad` as the source for CLI behavior.
- Preserve unrelated worktree changes. Do not reset, discard, or reformat files outside the requested scope.

## While editing

- Keep page content compatible with `src/content.config.ts` and block payloads compatible with `src/lib/blocks/schemas.ts`.
- Apply feature-pack files only when their CLI feature is selected.
- Keep source-specific CMS code behind `ContentProvider`.
- Prefer the smallest complete change and add tests when behavior changes.

## Verification

- Run `pnpm format:check` and `pnpm lint` for repository-wide quality checks.
- Run `pnpm typecheck` after TypeScript or template changes.
- Run `pnpm test` for CLI changes and `pnpm build` for generated-template changes.
- State any check that could not be run and why.

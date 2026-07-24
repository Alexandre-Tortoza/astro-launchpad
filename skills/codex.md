# Codex

Use the smallest verified change that preserves Astro Launchpad's content and
scaffolding boundaries.

- Inspect template, feature-pack, CLI, and test code before editing.
- Keep page content compatible with `src/content.config.ts` and block payloads
  compatible with `src/lib/blocks/schemas.ts`.
- Keep CMS mapping inside `ContentProvider`; visual blocks do not query a CMS.
- Apply a feature pack only when its CLI option is selected.
- Preserve unrelated worktree changes and do not reset or discard user work.
- Run `pnpm typecheck` after TypeScript or template work, `pnpm test` after CLI
  work, and `pnpm build` before completing generated-template changes.

# Development

## Requirements

- Node.js 22 or later
- pnpm 11.3.0 or later

## Setup

```bash
pnpm install --frozen-lockfile
pnpm dev
```

## Verification

```bash
pnpm check
pnpm pack:check
pnpm audit
```

`pnpm check` runs format validation, ESLint, TypeScript checks, and CLI tests. `pnpm pack:check` creates an npm tarball, installs it in a temporary directory, and runs the packaged CLI's help and version commands.

## Hooks

`pnpm install` enables Husky. Staged files are formatted and linted before commit. Commit messages must use Conventional Commits, such as `feat(cli): add version command`.

## Testing the CLI

Use `pnpm --filter create-astro-launchpad test` for CLI tests. Integration tests create projects in temporary directories and run the compiled CLI rather than importing source files directly.

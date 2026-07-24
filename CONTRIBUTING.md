# Contributing to Astro Launchpad

Thank you for contributing. Astro Launchpad is in `0.0.x`; changes should improve the tested base template and CLI without presenting planned feature packs as implemented.

## Setup

```bash
# Clone the repository from its GitHub page
git clone <repository-url>
cd astro-launchpad

# Install the pinned dependency graph
pnpm install --frozen-lockfile

# Run the full local verification
pnpm check
```

Node.js 22 or later and pnpm 11.3.0 or later are required.

## Monorepo structure

```
packages/       # Published packages
templates/      # Project templates and feature packs
docs/           # Documentation
skills/         # AI skill files
examples/       # Example projects
```

## Development

Use `pnpm dev` to start the base template. Use `pnpm --filter create-astro-launchpad test` for CLI-focused tests. Run `pnpm pack:check` when a change affects the published CLI package.

### Changing the CLI

1. Add or update behavior-focused tests in `packages/create-astro-launchpad/test/`.
2. Run `pnpm --filter create-astro-launchpad build` to test the compiled executable.
3. For a debugger session, run `node --inspect-brk packages/create-astro-launchpad/dist/index.js --help` after building.
4. Keep integration tests self-contained: create temporary directories in the test and clean them up. Add a checked-in fixture only when a stable input file makes the behavior clearer.

CLI changes must preserve both the interactive flow and the `--yes` non-interactive flow, or document an intentional limitation.

To add a top-level command, handle it in `src/index.ts` before option parsing, keep command-specific I/O in a focused module, add it to `helpText`, and test the compiled CLI's observable output and exit code.

Husky formats and lints staged files. Commit messages must follow Conventional Commits and include a description:

```text
feat(cli): add version command
fix(scaffold): reject non-empty destinations
```

Allowed types are `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, and `test`.

## Submitting changes

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature`
3. Make your changes
4. Add or update behavior-focused tests.
5. Update documentation and `CHANGELOG.md` when users can observe the change.
6. Run `pnpm check` and open a pull request.

Pull requests must explain the problem, implementation, validation, risks, and any intentional test omissions.

## License for contributions

By submitting a contribution, you agree that it is licensed under the repository's [AGPL-3.0-only license](./LICENSE).

## Code of Conduct

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

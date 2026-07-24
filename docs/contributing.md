# Contributing

Project setup, commit conventions, and pull request requirements are maintained in the repository-level [contributor guide](../CONTRIBUTING.md).

## CLI workflow

CLI behavior lives in `packages/create-astro-launchpad/src/`. Keep unit tests beside the behavior they exercise in `packages/create-astro-launchpad/test/`, and use temporary directories for integration tests so they can run in parallel and leave no local state behind.

```bash
pnpm --filter create-astro-launchpad test
pnpm --filter create-astro-launchpad build
pnpm pack:check
```

The package build is the executable that users install. Validate published-package changes with `pnpm pack:check`, not only source-level tests.

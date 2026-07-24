# Release Process

Releases are published from version tags only. Do not publish from a development machine.

1. Update `CHANGELOG.md` and the CLI package version.
2. Run `pnpm check`, `pnpm pack:check`, and `pnpm audit`.
3. Create a semver tag with `npm version <version> --workspace create-astro-launchpad` and push it as `v<version>`.
4. The release workflow validates the tag, packs and smoke-tests the CLI, publishes that exact tarball with npm provenance, and creates a GitHub Release.

To deprecate a bad npm version, use `npm deprecate create-astro-launchpad@<version> "reason"`, document the incident in the changelog, and publish a corrected version. Never replace an already-published package version.

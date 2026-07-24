# Release Process

Releases are published from version tags only. Do not publish from a development machine.

Before the first release, reserve `create-astro-launchpad` in npm and configure npm trusted publishing for this repository's release workflow. In GitHub, protect `main` and `v*` tags, require CI before merge, and require review for workflow changes.

1. Update `CHANGELOG.md` and the CLI package version.
2. Run `pnpm check`, `pnpm pack:check`, and `pnpm audit`.
3. Create a semver tag with `npm version <version> --workspace create-astro-launchpad` and push it as `v<version>`.
4. The release workflow validates the tag, packs and smoke-tests the CLI, publishes that exact tarball with npm provenance, and creates a GitHub Release.

To deprecate a bad npm version, use `npm deprecate create-astro-launchpad@<version> "reason"`, document the incident in the changelog, and publish a corrected version. Never replace an already-published package version.

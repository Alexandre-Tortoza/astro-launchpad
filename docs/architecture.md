# Architecture

Astro Launchpad is a pnpm monorepo. The `templates/base` workspace is the source template; `packages/create-astro-launchpad` is the npm-distributed CLI.

## Project creation flow

1. The CLI parses command-line flags or collects interactive answers.
2. It validates that the destination is empty.
3. The build embeds a clean copy of `templates/base` and the AGPL-3.0 license in the CLI package.
4. The CLI copies that template, updates `package.json`, and writes `astro-launchpad.json` with the selected preset and feature placeholders.
5. It optionally installs dependencies and initializes Git.

The CLI owns terminal interaction, filesystem writes, and child processes. Template components and content validation remain isolated in `templates/base`.

## Current boundaries

In `0.0.x`, presets and feature packs are not supported end-to-end workflows. They must not be described as installed functionality until their files, dependencies, tests, and documentation are complete.

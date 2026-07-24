# Architecture

Astro Launchpad is a pnpm monorepo. The `templates/base` workspace is the source template; `packages/create-astro-launchpad` is the npm-distributed CLI.

## Project creation flow

1. The CLI parses command-line flags or collects interactive answers.
2. It validates that the destination is empty.
3. The build embeds a clean copy of `templates/base` and the AGPL-3.0 license in the CLI package.
4. Unless `--dry-run` was requested, the CLI copies that template, updates `package.json`, writes `astro-launchpad.json` with the selected configuration, and applies supported feature assets.
5. It optionally installs dependencies and initializes Git.

The CLI owns terminal interaction, filesystem writes, and child processes. Template components and content validation remain isolated in `templates/base`.

## CLI boundaries and errors

`src/options.ts` parses and validates command-line input. `src/prompts.ts` owns interactive collection, while `src/scaffold.ts` performs filesystem writes only after verifying that the destination is empty. `src/process.ts` starts package-manager and Git commands without a shell. The `src/index.ts` entrypoint turns expected failures into concise user-facing messages and non-zero exit codes.

Keep new commands small: parse or route them in the entrypoint, isolate I/O from option validation, and test the compiled executable rather than only imported source functions.

## Compatibility

The CLI requires Node.js 22 or later. CI exercises Node.js 22 and 24 on Linux, macOS, and Windows. The packaged CLI is smoke-tested from the npm tarball before publication.

## Current boundaries

Presets are template overlays applied after the base template. They provide
Markdown demo content, site settings, and local placeholder assets. The Directus
feature pack replaces the default content provider and adds its SDK dependency;
SaaS and Agency use block shapes supported by that adapter.

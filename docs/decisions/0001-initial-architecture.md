# 0001: Monorepo with a distributable scaffolding CLI

## Status

Accepted

## Context

Astro Launchpad needs to evolve the base Astro template, generated-project assets, and the npm CLI independently while keeping generation reproducible.

## Decision

Use a pnpm monorepo. Keep `templates/base` as the source of the generated project and distribute `packages/create-astro-launchpad` as the `create-astro-launchpad` npm package. The CLI embeds the template during its build, validates its destination before writing, and keeps terminal interaction separate from filesystem and process operations.

## Consequences

The repository has one source of truth for generated files and can test the packaged CLI. Feature packs remain explicit opt-in additions, and visual components stay independent from CMS SDKs through the template content layer.

# CLI

Create a project interactively:

```bash
pnpm create astro-launchpad my-site
```

The CLI prompts for the project name, preset, features, package manager,
dependency installation, and Git initialization.

All selections can also be supplied as flags for unattended use:

```bash
pnpm create astro-launchpad my-site \
  --preset agency \
  --cms directus \
  --ai-kit \
  --tailwind \
  --blog \
  --package-manager pnpm \
  --yes
```

Use `--help` to list every option. The CLI always copies the base template and
records selected presets and features in `astro-launchpad.json`. `--ai-kit`
copies ai-kit prompts, skills, schemas, and examples into the generated project.
Other feature selections remain configuration-only unless explicitly documented.

Use `--version` to print the installed CLI version. Errors are written to standard error and return a non-zero exit code. Add `--debug` to include a stack trace when diagnosing an unexpected failure.

## Safe defaults

The destination must be empty. This prevents the CLI from overwriting an existing project. Use `--skip-install --no-git` to generate files without running a package manager or Git.

## Preview a project plan

Use `--dry-run` to resolve flags or prompt answers and inspect the resulting project plan without creating a directory, copying files, installing dependencies, or initializing Git:

```bash
pnpm create astro-launchpad my-site -- --preset agency --yes --dry-run
```

## Diagnose a generated project

From the root of a generated project, run:

```bash
npx create-astro-launchpad doctor
```

The doctor checks the Node.js version, package manager, required Directus environment variables, Docker when selected, and whether Astro's default port is available.

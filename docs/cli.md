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

Use `--help` to list every option. The CLI applies the selected preset over the
base template, including its Markdown demo content and local SVG placeholder
assets, then records the selection in `astro-launchpad.json`. SaaS and Agency
can also use the Directus content provider with `--cms directus`. `--ai-kit`
copies prompts, skills, schemas, and examples into the generated project.

## Presets

| Preset           | Demo use case                    |
| ---------------- | -------------------------------- |
| `saas`           | Operations software landing page |
| `agency`         | Independent creative studio      |
| `local-business` | Neighborhood bakery              |
| `portfolio`      | Independent product designer     |
| `waitlist`       | Early-access product launch      |
| `event`          | Design and technology gathering  |

All presets work with the default Markdown provider. The content lives in
`src/content/pages/home.md` and `src/content/settings/site.md`, so it can be
edited without changing components. SaaS and Agency also include content shapes
supported by the Directus schema and adapter.

## Feature packs

`--tailwind`, `--blog`, `--motion`, `--docker`, `--ai-kit`, and
`--cms directus` apply their corresponding files to the generated project.
Tailwind and Blog also add their runtime dependencies to `package.json`. When
Docker and Directus are both selected, the Directus Compose configuration is
kept so `docker compose up` starts the CMS stack.

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

The doctor checks the Node.js version, package manager, Docker when selected,
Astro's default port, and the generated build configuration. For Directus it
also validates required environment variables, the service health endpoint, and
the `pages`, `sections`, and `site_settings` collections. It only reports
problems and never changes project files.

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

Use `--version` to print the installed CLI version. Errors are written to standard error and return a non-zero exit code.

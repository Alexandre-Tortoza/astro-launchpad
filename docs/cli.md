# CLI

Create a project interactively:

```bash
pnpm create astro-launchpad my-site
```

The CLI prompts for the project name, preset, feature placeholders, package manager, dependency installation, and Git initialization.

All selections can also be supplied as flags for unattended use:

```bash
pnpm create astro-launchpad my-site \
  --preset agency \
  --cms directus \
  --tailwind \
  --blog \
  --package-manager pnpm \
  --yes
```

Use `--help` to list every option. Version one always copies the base template and records selected presets and features in `astro-launchpad.json`. Feature packs are not yet supported end-to-end workflows, even when experimental scaffold files are present.

Use `--version` to print the installed CLI version. Errors are written to standard error and return a non-zero exit code.

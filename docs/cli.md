# CLI

Create a project interactively:

```bash
pnpm create astro-launchpad my-site
```

The CLI prompts for the project name, preset, Tailwind, CMS, blog, Motion, Docker, AIkit, package manager, dependency installation, and Git initialization.

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

Use `--help` to list every option. Version one always copies the base template. It records the selected preset and feature placeholders in `astro-launchpad.json`; it does not yet add feature-pack source files or dependencies.

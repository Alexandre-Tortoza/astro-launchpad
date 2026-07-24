# Directus setup

Use `cms:setup` as the only local bootstrap entrypoint. It starts the Directus
dependencies, applies the schema snapshot, creates the local server token, and
seeds content. Do not ask an editor to manually create a token as part of the
normal development flow.

The Astro provider runs only on the server and reads `DIRECTUS_URL` and
`DIRECTUS_TOKEN` from `process.env`. Do not change them to `import.meta.env` or
prefix either value with `PUBLIC_`.

Directus 11 administrator access is policy based. If the seed reports that the
token cannot read system permissions, repair the administrator's direct access
policy in Directus, restart the service, and rerun `cms:setup`. Schema snapshots
must not contain generated administrator user IDs.

Treat `.env` as local or deployment-secret material. Production must use unique
Directus, database, and administrator secrets, and should replace the initial
administrator token with a restricted server-only read token after setup.

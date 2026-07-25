# Strapi setup

Docker Compose is the local bootstrap entrypoint. On first start, `cms/src/index.ts`
runs an idempotent bootstrap that creates the admin user, provisions a read-only API
token, grants public read access, and seeds demo content. Do not ask an editor to
manually create a token or run a CMS setup command as part of the normal development
flow.

The Astro provider runs only on the server and reads `STRAPI_URL` and `STRAPI_TOKEN`
from `process.env`. Do not change them to `import.meta.env` or prefix either value
with `PUBLIC_`.

The admin panel is available at `http://localhost:1337/admin` during development. Log
in with `STRAPI_ADMIN_EMAIL` and `STRAPI_ADMIN_PASSWORD` from your `.env` file.

`STRAPI_ADMIN_PASSWORD` must contain at least one uppercase letter, one lowercase
letter, and one digit (Strapi policy). The scaffold generates a suitable password
automatically.

Treat `.env` as local or deployment-secret material. Production must use unique
secrets and should restrict the token to the minimum required permissions after setup.

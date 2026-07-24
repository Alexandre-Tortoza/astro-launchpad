# Security

The generated `.gitignore` excludes `.env` files while retaining
`.env.example`. Keep credentials such as `DIRECTUS_TOKEN` in server-side
environment configuration only. Variables prefixed with `PUBLIC_` are exposed
to browser code and must never contain secrets.

Page sections are validated against their block schemas before rendering. Blog
content is rendered as escaped text by default; do not use `set:html` for CMS or
Markdown content unless it has first passed through a reviewed HTML sanitizer.

For Directus, issue a least-privilege read token for the site and a separate
editor role for the CMS. Rotate compromised credentials, back up PostgreSQL and
uploaded assets regularly, and restrict CORS to the deployed site origins.

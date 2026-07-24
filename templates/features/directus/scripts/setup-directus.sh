#!/usr/bin/env bash
set -euo pipefail

compose_file="${COMPOSE_FILE:-compose.dev.yml}"

if ! command -v docker >/dev/null 2>&1; then
  printf '%s\n' "Docker is required to initialize Directus." >&2
  exit 1
fi

if [ ! -f .env ]; then
  printf '%s\n' "Missing .env. Re-run the generator or create it from .env.example." >&2
  exit 1
fi

printf '%s\n' "Starting PostgreSQL and Directus..."
docker compose -f "$compose_file" up -d postgres directus

printf '%s' "Waiting for Directus"
until docker compose -f "$compose_file" exec -T directus \
  wget --spider -q http://127.0.0.1:8055/server/health; do
  printf '.'
  sleep 2
done
printf '\n'

printf '%s\n' "Applying the Directus schema..."
directus_container="$(docker compose -f "$compose_file" ps -q directus)"
docker cp schema/snapshot.json "$directus_container:/tmp/astro-launchpad-schema.json"
docker compose -f "$compose_file" exec -T directus \
  npx directus schema apply /tmp/astro-launchpad-schema.json --yes

# Directus 11 snapshots can preserve the administrator policy while removing
# its direct user access link. Restore it before asking the API for a token.
admin_email="$(node --input-type=module <<'NODE'
import { readFile } from 'node:fs/promises';
const env = await readFile('.env', 'utf8');
const match = env.match(/^DIRECTUS_ADMIN_EMAIL=(.*)$/m);
process.stdout.write(match?.[1] || 'admin@example.com');
NODE
)"
docker compose -f "$compose_file" exec -T postgres \
  psql -v ON_ERROR_STOP=1 -U "${DB_USER:-directus}" -d "${DB_DATABASE:-directus}" \
  -c "INSERT INTO directus_access (id, \"user\", policy) SELECT gen_random_uuid(), u.id, p.id FROM directus_users u CROSS JOIN directus_policies p WHERE u.email = '$admin_email' AND p.name = 'Administrator' AND NOT EXISTS (SELECT 1 FROM directus_access a WHERE a.\"user\" = u.id AND a.policy = p.id);"
docker compose -f "$compose_file" restart directus

printf '%s' "Waiting for Directus after policy repair"
until docker compose -f "$compose_file" exec -T directus \
  wget --spider -q http://127.0.0.1:8055/server/health; do
  printf '.'
  sleep 2
done
printf '\n'

token="$(node --input-type=module <<'NODE'
import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const envText = await readFile('.env', 'utf8');
const env = Object.fromEntries(
  envText.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    return match ? [[match[1], match[2]]] : [];
  }),
);
const directusPort = process.env.DIRECTUS_PORT || env.DIRECTUS_PORT || '8055';
const baseUrl = `http://127.0.0.1:${directusPort}`;
const login = await fetch(`${baseUrl}/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: env.DIRECTUS_ADMIN_EMAIL, password: env.DIRECTUS_ADMIN_PASSWORD }),
});
if (!login.ok) throw new Error(`Directus login failed: ${await login.text()}`);
const accessToken = (await login.json()).data.access_token;
const meResponse = await fetch(`${baseUrl}/users/me`, {
  headers: { authorization: `Bearer ${accessToken}` },
});
if (!meResponse.ok) throw new Error(`Could not read Directus administrator: ${await meResponse.text()}`);
const user = (await meResponse.json()).data;
const token = randomBytes(32).toString('hex');
const update = await fetch(`${baseUrl}/users/${user.id}`, {
  method: 'PATCH',
  headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
  body: JSON.stringify({ token }),
});
if (!update.ok) throw new Error(`Could not create the Directus runtime token: ${await update.text()}`);
await writeFile('.env', envText.replace(/^DIRECTUS_TOKEN=.*$/m, `DIRECTUS_TOKEN=${token}`));
process.stdout.write(token);
NODE
)"

directus_port="$(node --input-type=module <<'NODE'
import { readFile } from 'node:fs/promises';
const env = await readFile('.env', 'utf8');
const match = env.match(/^DIRECTUS_PORT=(.*)$/m);
process.stdout.write(process.env.DIRECTUS_PORT || match?.[1] || '8055');
NODE
)"

printf '%s\n' "Seeding content..."
DIRECTUS_URL="http://localhost:${directus_port}" DIRECTUS_TOKEN="$token" \
  ./node_modules/.bin/tsx seed/seed.ts

printf '%s\n' "Directus is ready. Start the site with: docker compose up --build"

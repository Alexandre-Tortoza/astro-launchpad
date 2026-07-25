import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { PackageManager, ProjectOptions } from "./types.js";
import { isServerCms } from "./types.js";

interface PackageManagerConfig {
  lockfile: string;
  install: string;
  run: (script: string, arguments_?: string) => string;
}

function packageManagerConfig(
  packageManager: PackageManager,
): PackageManagerConfig {
  switch (packageManager) {
    case "npm":
      return {
        lockfile: "package-lock.json",
        install: "npm ci",
        run: (script, arguments_ = "") =>
          `npm run ${script}${arguments_ ? ` -- ${arguments_}` : ""}`,
      };
    case "yarn":
      return {
        lockfile: "yarn.lock",
        install: "yarn install --frozen-lockfile",
        run: (script, arguments_ = "") => `yarn ${script} ${arguments_}`.trim(),
      };
    case "bun":
      return {
        lockfile: "bun.lock",
        install: "bun install --frozen-lockfile",
        run: (script, arguments_ = "") =>
          `bun run ${script} ${arguments_}`.trim(),
      };
    case "pnpm":
      return {
        lockfile: "pnpm-lock.yaml",
        install: "pnpm install --frozen-lockfile",
        run: (script, arguments_ = "") => `pnpm ${script} ${arguments_}`.trim(),
      };
  }
}

function dockerBase(packageManager: PackageManager): string {
  const bunInstall =
    packageManager === "bun" ? " && npm install --global bun" : "";
  return `FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable${bunInstall}
`;
}

function dockerfile(packageManager: PackageManager, isServer: boolean): string {
  const manager = packageManagerConfig(packageManager);
  const workspaceFile = packageManager === "pnpm" ? " pnpm-workspace.yaml" : "";
  const output = isServer
    ? `FROM base AS runner
ENV HOST=0.0.0.0
ENV PORT=4321
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
`
    : `FROM nginx:1.31-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;

  return `${dockerBase(packageManager)}
FROM base AS deps
COPY package.json ${manager.lockfile}${workspaceFile} ./
RUN ${manager.install}

FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 4321
CMD ["sh", "-c", "${manager.run("dev", "--host 0.0.0.0")}"]

FROM base AS builder
ARG PUBLIC_SITE_URL
ARG ASTRO_OUTPUT=${isServer ? "server" : "static"}
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL
ENV ASTRO_OUTPUT=$ASTRO_OUTPUT
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN ${manager.run("build")}

${output}`;
}

function staticDevCompose(packageManager: PackageManager): string {
  const manager = packageManagerConfig(packageManager);
  return `services:
  web:
    build:
      context: .
      target: dev
    command: sh -c '${manager.run("dev", "--host 0.0.0.0")}'
    ports:
      - "${"${PORT:-4321}"}:4321"
    volumes:
      - .:/app
      - web_node_modules:/app/node_modules
      - web_astro:/app/.astro
    environment:
      HOST: 0.0.0.0
      PORT: "4321"

volumes:
  web_node_modules:
  web_astro:
`;
}

function staticProdCompose(): string {
  return `services:
  web:
    build:
      context: .
      target: runner
      args:
        PUBLIC_SITE_URL: ${"${PUBLIC_SITE_URL:?Set PUBLIC_SITE_URL in .env}"}
    ports:
      - "${"${PORT:-3000}"}:80"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost/"]
      interval: 30s
      timeout: 5s
      retries: 3
`;
}

function directusServices(
  packageManager: PackageManager,
  production: boolean,
): string {
  const manager = packageManagerConfig(packageManager);
  const publicUrl = production
    ? "${DIRECTUS_PUBLIC_URL:?Set DIRECTUS_PUBLIC_URL in .env}"
    : "${DIRECTUS_PUBLIC_URL:-http://localhost:8055}";
  const webPort = production ? "${PORT:-3000}:4321" : "${PORT:-4321}:4321";
  const directusPort = production
    ? "127.0.0.1:${DIRECTUS_PORT:-8055}:8055"
    : "${DIRECTUS_PORT:-8055}:8055";
  const volumeLines = production
    ? ""
    : `    volumes:
      - .:/app
      - web_node_modules:/app/node_modules
      - web_astro:/app/.astro
    command: sh -c '${manager.run("dev", "--host 0.0.0.0")}'
`;

  return `services:
  web:
    build:
      context: .
      target: ${production ? "runner" : "dev"}
      args:
        ASTRO_OUTPUT: server
        PUBLIC_SITE_URL: ${"${PUBLIC_SITE_URL:-http://localhost:3000}"}
    ports:
      - "${webPort}"
    environment:
      HOST: 0.0.0.0
      PORT: "4321"
      ASTRO_OUTPUT: server
      PUBLIC_SITE_URL: ${"${PUBLIC_SITE_URL:-http://localhost:3000}"}
      DIRECTUS_URL: http://directus:8055
      DIRECTUS_TOKEN: ${"${DIRECTUS_TOKEN:-}"}
${volumeLines}    depends_on:
      directus-init:
        condition: service_completed_successfully
    restart: unless-stopped

  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: ${"${DB_USER:-directus}"}
      POSTGRES_PASSWORD: ${"${DB_PASSWORD:?Set DB_PASSWORD in .env}"}
      POSTGRES_DB: ${"${DB_DATABASE:-directus}"}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${"${DB_USER:-directus}"}"]
      interval: 10s
      timeout: 5s
      retries: 10
    restart: unless-stopped

  directus-schema:
    image: directus/directus:12.1.1
    command: ["/bin/sh", "-ec", "node /directus/cli.js bootstrap && node /directus/cli.js schema apply /directus/project/schema/snapshot.json --yes"]
    environment:
      SECRET: ${"${DIRECTUS_SECRET:?Set DIRECTUS_SECRET in .env}"}
      DB_CLIENT: pg
      DB_HOST: postgres
      DB_PORT: "5432"
      DB_DATABASE: ${"${DB_DATABASE:-directus}"}
      DB_USER: ${"${DB_USER:-directus}"}
      DB_PASSWORD: ${"${DB_PASSWORD:?Set DB_PASSWORD in .env}"}
      ADMIN_EMAIL: ${"${DIRECTUS_ADMIN_EMAIL:?Set DIRECTUS_ADMIN_EMAIL in .env}"}
      ADMIN_PASSWORD: ${"${DIRECTUS_ADMIN_PASSWORD:?Set DIRECTUS_ADMIN_PASSWORD in .env}"}
    volumes:
      - ./schema:/directus/project/schema:ro
    depends_on:
      postgres:
        condition: service_healthy
    restart: "no"

  directus-policy:
    image: postgres:17-alpine
    environment:
      PGHOST: postgres
      PGUSER: ${"${DB_USER:-directus}"}
      PGDATABASE: ${"${DB_DATABASE:-directus}"}
      PGPASSWORD: ${"${DB_PASSWORD:?Set DB_PASSWORD in .env}"}
      DIRECTUS_ADMIN_EMAIL: ${"${DIRECTUS_ADMIN_EMAIL:?Set DIRECTUS_ADMIN_EMAIL in .env}"}
      DIRECTUS_TOKEN: ${"${DIRECTUS_TOKEN:?Set DIRECTUS_TOKEN in .env}"}
    command:
      - /bin/sh
      - -ec
      - |
        psql -v ON_ERROR_STOP=1 -v token="$$DIRECTUS_TOKEN" -v admin_email="$$DIRECTUS_ADMIN_EMAIL" <<'SQL'
        UPDATE directus_users SET token = :'token' WHERE email = :'admin_email';
        INSERT INTO directus_access (id, "user", policy)
        SELECT gen_random_uuid(), u.id, p.id
        FROM directus_users u CROSS JOIN directus_policies p
        WHERE u.email = :'admin_email' AND p.name = 'Administrator'
          AND NOT EXISTS (
            SELECT 1 FROM directus_access a
            WHERE a."user" = u.id AND a.policy = p.id
          );
        SQL
    depends_on:
      directus-schema:
        condition: service_completed_successfully
    restart: "no"

  directus:
    image: directus/directus:12.1.1
    ports:
      - "${directusPort}"
    environment:
      SECRET: ${"${DIRECTUS_SECRET:?Set DIRECTUS_SECRET in .env}"}
      DB_CLIENT: pg
      DB_HOST: postgres
      DB_PORT: "5432"
      DB_DATABASE: ${"${DB_DATABASE:-directus}"}
      DB_USER: ${"${DB_USER:-directus}"}
      DB_PASSWORD: ${"${DB_PASSWORD:?Set DB_PASSWORD in .env}"}
      ADMIN_EMAIL: ${"${DIRECTUS_ADMIN_EMAIL:?Set DIRECTUS_ADMIN_EMAIL in .env}"}
      ADMIN_PASSWORD: ${"${DIRECTUS_ADMIN_PASSWORD:?Set DIRECTUS_ADMIN_PASSWORD in .env}"}
      PUBLIC_URL: ${publicUrl}
    volumes:
      - directus_uploads:/directus/uploads
      - directus_extensions:/directus/extensions
    depends_on:
      directus-policy:
        condition: service_completed_successfully
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://127.0.0.1:8055/server/health"]
      interval: 10s
      timeout: 5s
      retries: 15
    restart: unless-stopped

  directus-init:
    build:
      context: .
      target: dev
    command: ./node_modules/.bin/tsx seed/seed.ts
    environment:
      DIRECTUS_URL: http://directus:8055
      DIRECTUS_TOKEN: ${"${DIRECTUS_TOKEN:?Set DIRECTUS_TOKEN in .env}"}
    depends_on:
      directus:
        condition: service_healthy
    restart: "no"

volumes:
  postgres_data:
  directus_uploads:
  directus_extensions:
${production ? "" : "  web_node_modules:\n  web_astro:\n"}`;
}

function strapiServices(
  packageManager: PackageManager,
  production: boolean,
): string {
  const manager = packageManagerConfig(packageManager);
  const webPort = production ? "${PORT:-3000}:4321" : "${PORT:-4321}:4321";
  const volumeLines = production
    ? ""
    : `    volumes:
      - .:/app
      - web_node_modules:/app/node_modules
      - web_astro:/app/.astro
    command: sh -c '${manager.run("dev", "--host 0.0.0.0")}'
`;

  return `services:
  web:
    build:
      context: .
      target: ${production ? "runner" : "dev"}
      args:
        ASTRO_OUTPUT: server
        PUBLIC_SITE_URL: ${"${PUBLIC_SITE_URL:-http://localhost:3000}"}
    ports:
      - "${webPort}"
    environment:
      HOST: 0.0.0.0
      PORT: "4321"
      ASTRO_OUTPUT: server
      PUBLIC_SITE_URL: ${"${PUBLIC_SITE_URL:-http://localhost:3000}"}
      STRAPI_URL: http://strapi:1337
      STRAPI_TOKEN: ${"${STRAPI_TOKEN:-}"}
${volumeLines}    depends_on:
      strapi:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: ${"${DB_USER:-strapi}"}
      POSTGRES_PASSWORD: ${"${DB_PASSWORD:?Set DB_PASSWORD in .env}"}
      POSTGRES_DB: ${"${DB_NAME:-strapi}"}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${"${DB_USER:-strapi}"}"]
      interval: 10s
      timeout: 5s
      retries: 10
    restart: unless-stopped

  strapi:
    build:
      context: ./cms
      target: ${production ? "runner" : "dev"}
    ports:
      - "${"${STRAPI_PORT:-1337}"}:1337"
    environment:
      NODE_ENV: ${production ? "production" : "development"}
      APP_KEYS: ${"${APP_KEYS:?Set APP_KEYS in .env}"}
      API_TOKEN_SALT: ${"${API_TOKEN_SALT:?Set API_TOKEN_SALT in .env}"}
      ADMIN_JWT_SECRET: ${"${ADMIN_JWT_SECRET:?Set ADMIN_JWT_SECRET in .env}"}
      TRANSFER_TOKEN_SALT: ${"${TRANSFER_TOKEN_SALT:?Set TRANSFER_TOKEN_SALT in .env}"}
      JWT_SECRET: ${"${JWT_SECRET:?Set JWT_SECRET in .env}"}
      ENCRYPTION_KEY: ${"${ENCRYPTION_KEY:?Set ENCRYPTION_KEY in .env}"}
      DATABASE_CLIENT: postgres
      DATABASE_HOST: postgres
      DATABASE_PORT: "5432"
      DATABASE_NAME: ${"${DB_NAME:-strapi}"}
      DATABASE_USERNAME: ${"${DB_USER:-strapi}"}
      DATABASE_PASSWORD: ${"${DB_PASSWORD:?Set DB_PASSWORD in .env}"}
      STRAPI_ADMIN_EMAIL: ${"${STRAPI_ADMIN_EMAIL:?Set STRAPI_ADMIN_EMAIL in .env}"}
      STRAPI_ADMIN_PASSWORD: ${"${STRAPI_ADMIN_PASSWORD:?Set STRAPI_ADMIN_PASSWORD in .env}"}
      STRAPI_TOKEN: ${"${STRAPI_TOKEN:?Set STRAPI_TOKEN in .env}"}
      PUBLIC_URL: ${"${STRAPI_PUBLIC_URL:-http://localhost:1337}"}
    volumes:
      - strapi_uploads:/opt/app/public/uploads
      ${production ? "" : "- ./cms:/opt/app\n      - strapi_node_modules:/opt/app/node_modules"}
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://127.0.0.1:1337/_health"]
      interval: 10s
      timeout: 5s
      retries: 20
      start_period: 60s
    restart: unless-stopped

volumes:
  postgres_data:
  strapi_uploads:
${production ? "" : "  web_node_modules:\n  web_astro:\n  strapi_node_modules:\n"}`;
}

export async function writeDockerConfiguration(
  destination: string,
  options: ProjectOptions,
): Promise<void> {
  const { cms } = options.features;
  const isDirectus = cms === "directus";
  const isStrapi = cms === "strapi";
  if (!options.features.docker && !isServerCms(cms)) return;

  await writeFile(
    join(destination, "Dockerfile"),
    dockerfile(options.packageManager, isServerCms(cms)),
  );
  const dockerignoreExtra = isStrapi ? "cms\n" : "";
  await writeFile(
    join(destination, ".dockerignore"),
    `node_modules\n.astro\ndist\n.git\n.env\n.env.*\n!.env.example\n.pnpm-store\n${dockerignoreExtra}`,
  );
  const developmentCompose = isDirectus
    ? directusServices(options.packageManager, false)
    : isStrapi
      ? strapiServices(options.packageManager, false)
      : staticDevCompose(options.packageManager);
  await writeFile(join(destination, "compose.dev.yml"), developmentCompose);
  // `docker compose up` is the safe local-development default.
  await writeFile(join(destination, "compose.yml"), developmentCompose);
  await writeFile(
    join(destination, "compose.prod.yml"),
    isDirectus
      ? directusServices(options.packageManager, true)
      : isStrapi
        ? strapiServices(options.packageManager, true)
        : staticProdCompose(),
  );
  await rm(join(destination, "docker-compose.yml"), { force: true });
}

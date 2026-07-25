import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { basename, join } from "node:path";
import { writeDockerConfiguration } from "./docker.js";
import type { LaunchpadManifest, ProjectOptions } from "./types.js";
import { isServerCms } from "./types.js";

const excludedTemplateDirectories = new Set(["node_modules", ".astro", "dist"]);

async function applyTemplateOverlay(
  packDirectory: string,
  destination: string,
): Promise<void> {
  const entries = await readdir(packDirectory, { withFileTypes: true });
  for (const entry of entries) {
    if (["package.json", "node_modules", ".astro", "dist"].includes(entry.name))
      continue;
    const sourcePath = join(packDirectory, entry.name);
    const destPath = join(destination, entry.name);
    if (entry.name === ".env.example") {
      const packContent = await readFile(sourcePath, "utf8");
      try {
        const existing = await readFile(destPath, "utf8");
        await writeFile(destPath, `${existing.trimEnd()}\n\n${packContent}`);
      } catch {
        await writeFile(destPath, packContent);
      }
    } else if (entry.isDirectory()) {
      await cp(sourcePath, destPath, { recursive: true });
    } else {
      await cp(sourcePath, destPath);
    }
  }
}

interface PackPackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

function packageRunCommand(
  packageManager: ProjectOptions["packageManager"],
): string {
  switch (packageManager) {
    case "npm":
      return "npm run";
    case "yarn":
      return "yarn";
    case "bun":
      return "bun run";
    case "pnpm":
      return "pnpm";
  }
}

async function mergePackPackageJson(
  packageJson: Record<string, unknown>,
  packDirectory: string,
): Promise<void> {
  const pack = JSON.parse(
    await readFile(join(packDirectory, "package.json"), "utf8"),
  ) as PackPackageJson;

  for (const field of ["dependencies", "devDependencies", "scripts"] as const) {
    if (!pack[field]) continue;
    const values = (packageJson[field] ?? {}) as Record<string, string>;
    Object.assign(values, pack[field]);
    packageJson[field] = values;
  }
}

async function writeAstroConfiguration(
  destination: string,
  options: ProjectOptions,
): Promise<void> {
  if (!isServerCms(options.features.cms)) return;
  const tailwind = options.features.tailwind
    ? 'import tailwindcss from "@tailwindcss/vite";\n'
    : "";
  const vite = options.features.tailwind
    ? "  vite: { plugins: [tailwindcss()] },\n"
    : "";
  await writeFile(
    join(destination, "astro.config.mjs"),
    `import { defineConfig } from "astro/config";\nimport node from "@astrojs/node";\nimport sitemap from "@astrojs/sitemap";\n${tailwind}\nexport default defineConfig({\n  site: process.env.PUBLIC_SITE_URL ?? "https://example.com",\n  integrations: [sitemap()],\n  output: "server",\n  adapter: node({ mode: "standalone" }),\n${vite}});\n`,
  );
}

export async function ensureEmptyDestination(
  destination: string,
): Promise<void> {
  try {
    const entries = await readdir(destination);
    if (entries.length > 0)
      throw new Error(`Destination directory is not empty: ${destination}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await mkdir(destination, { recursive: true });
      return;
    }
    throw error;
  }
}

export async function scaffoldProject(
  templateDirectory: string,
  options: ProjectOptions,
): Promise<void> {
  await ensureEmptyDestination(options.destination);
  await cp(templateDirectory, options.destination, {
    recursive: true,
    filter(source) {
      return !excludedTemplateDirectories.has(basename(source));
    },
  });

  const packagePath = join(options.destination, "package.json");
  const packageJson = JSON.parse(await readFile(packagePath, "utf8")) as Record<
    string,
    unknown
  >;
  packageJson.name = options.projectName;
  packageJson.private = true;

  const featuresDirectory = join(templateDirectory, "..", "features");
  for (const feature of [
    options.features.tailwind && "tailwind",
    options.features.blog && "blog",
    options.features.cms === "directus" && "directus",
    options.features.cms === "strapi" && "strapi",
  ]) {
    if (feature)
      await mergePackPackageJson(packageJson, join(featuresDirectory, feature));
  }
  const scripts = (packageJson.scripts ?? {}) as Record<string, string>;
  const run = packageRunCommand(options.packageManager);
  scripts.check = `${run} lint && ${run} typecheck && ${run} build`;
  if (options.features.docker || isServerCms(options.features.cms)) {
    scripts["docker:dev"] = "docker compose -f compose.dev.yml up --build";
    scripts["docker:prod"] = "docker compose -f compose.prod.yml up --build";
  }
  packageJson.scripts = scripts;
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

  const manifest: LaunchpadManifest = {
    preset: options.preset,
    features: options.features,
  };
  await writeFile(
    join(options.destination, "astro-launchpad.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  if (options.packageManager === "pnpm") {
    await writeFile(
      join(options.destination, "pnpm-workspace.yaml"),
      "allowBuilds:\n  esbuild: true\n  sharp: true\n",
    );
  }

  await applyTemplateOverlay(
    join(templateDirectory, "..", "presets", options.preset),
    options.destination,
  );

  if (options.features.tailwind) {
    await applyTemplateOverlay(
      join(featuresDirectory, "tailwind"),
      options.destination,
    );
  }
  if (options.features.blog) {
    await applyTemplateOverlay(
      join(featuresDirectory, "blog"),
      options.destination,
    );
  }
  if (options.features.motion) {
    await applyTemplateOverlay(
      join(featuresDirectory, "motion"),
      options.destination,
    );
  }
  if (options.features.docker) {
    await applyTemplateOverlay(
      join(featuresDirectory, "docker"),
      options.destination,
    );
  }
  if (options.features.aiKit) {
    await applyTemplateOverlay(
      join(featuresDirectory, "ai-kit"),
      options.destination,
    );
  }
  if (options.features.cms === "directus") {
    await applyTemplateOverlay(
      join(featuresDirectory, "directus"),
      options.destination,
    );

    const randomSecret = () => randomBytes(32).toString("hex");
    await writeFile(
      join(options.destination, ".env"),
      `PUBLIC_SITE_URL=http://localhost:3000\nPUBLIC_SITE_NAME=${options.projectName}\nPORT=3000\nDIRECTUS_URL=http://localhost:8055\nDIRECTUS_PORT=8055\nDIRECTUS_PUBLIC_URL=http://localhost:8055\nDB_USER=directus\nDB_DATABASE=directus\nDB_PASSWORD=${randomSecret()}\nDIRECTUS_SECRET=${randomSecret()}\nDIRECTUS_ADMIN_EMAIL=admin@example.com\nDIRECTUS_ADMIN_PASSWORD=${randomSecret()}\nDIRECTUS_TOKEN=${randomSecret()}\n`,
    );
  }

  if (options.features.cms === "strapi") {
    await applyTemplateOverlay(
      join(featuresDirectory, "strapi"),
      options.destination,
    );

    const randomSecret = () => randomBytes(32).toString("hex");
    const randomBase64 = () => randomBytes(16).toString("base64");
    await writeFile(
      join(options.destination, ".env"),
      [
        `PUBLIC_SITE_URL=http://localhost:3000`,
        `PUBLIC_SITE_NAME=${options.projectName}`,
        `PORT=3000`,
        `APP_KEYS=${[1, 2, 3, 4].map(() => randomBase64()).join(",")}`,
        `API_TOKEN_SALT=${randomSecret()}`,
        `ADMIN_JWT_SECRET=${randomSecret()}`,
        `TRANSFER_TOKEN_SALT=${randomSecret()}`,
        `JWT_SECRET=${randomSecret()}`,
        `ENCRYPTION_KEY=${randomSecret()}`,
        `DB_CLIENT=postgres`,
        `DB_HOST=localhost`,
        `DB_PORT=5432`,
        `DB_NAME=strapi`,
        `DB_USER=strapi`,
        `DB_PASSWORD=${randomSecret()}`,
        `STRAPI_URL=http://localhost:1337`,
        `STRAPI_PORT=1337`,
        `STRAPI_PUBLIC_URL=http://localhost:1337`,
        `STRAPI_ADMIN_EMAIL=admin@example.com`,
        `STRAPI_ADMIN_PASSWORD=Aa1-${randomSecret().slice(0, 12)}`,
        `STRAPI_TOKEN=${randomSecret()}`,
        ``,
      ].join("\n"),
    );
  }

  await writeAstroConfiguration(options.destination, options);
  await writeDockerConfiguration(options.destination, options);
}

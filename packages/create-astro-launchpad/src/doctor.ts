import { access, readFile } from "node:fs/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { createServer } from "node:net";
import { join } from "node:path";
import { spawn } from "node:child_process";
import * as p from "@clack/prompts";
import type { LaunchpadManifest, PackageManager } from "./types.js";
import { isServerCms } from "./types.js";

interface Issue {
  message: string;
  fix: string;
}

export function parseDotEnv(content: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const raw = trimmed.slice(eqIndex + 1).trim();
    env[key] = raw.replace(/^["']|["']$/g, "");
  }
  return env;
}

export async function inferPackageManager(
  cwd: string,
): Promise<PackageManager> {
  const checks: Array<[string, PackageManager]> = [
    ["pnpm-workspace.yaml", "pnpm"],
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "yarn"],
    ["bun.lockb", "bun"],
    ["package-lock.json", "npm"],
  ];
  for (const [file, pm] of checks) {
    try {
      await access(join(cwd, file));
      return pm;
    } catch {
      // not found, try next
    }
  }
  return "pnpm";
}

export function meetsNodeRequirement(
  version: string,
  required: string,
): boolean {
  const parse = (v: string) => v.replace(/^v/, "").split(".").map(Number);
  const [rMaj, rMin = 0, rPat = 0] = parse(required);
  const [aMaj, aMin = 0, aPat = 0] = parse(version);
  if (aMaj !== rMaj) return aMaj > rMaj;
  if (aMin !== rMin) return aMin > rMin;
  return aPat >= rPat;
}

function isCommandAvailable(command: string): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(command, ["--version"], { stdio: "pipe" });
    child.once("error", () => resolve(false));
    child.once("close", (code) => resolve(code === 0));
  });
}

function isDockerRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn("docker", ["info"], { stdio: "pipe" });
    child.once("error", () => resolve(false));
    child.once("close", (code) => resolve(code === 0));
  });
}

function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => server.close(() => resolve(true)));
    server.listen(port, "127.0.0.1");
  });
}

function fetchHttpStatus(
  url: string,
  headers?: Record<string, string>,
): Promise<number> {
  return new Promise((resolve) => {
    const requester = url.startsWith("https://") ? httpsRequest : httpRequest;
    const req = requester(url, { timeout: 5000, headers }, (res) => {
      res.resume();
      resolve(res.statusCode ?? 0);
    });
    req.once("error", () => resolve(0));
    req.once("timeout", () => {
      req.destroy();
      resolve(0);
    });
    req.end();
  });
}

const NODE_REQUIREMENT = "22.12.0";
const STRAPI_ENVIRONMENT = [
  "STRAPI_TOKEN",
  "APP_KEYS",
  "API_TOKEN_SALT",
  "ADMIN_JWT_SECRET",
  "JWT_SECRET",
  "DB_PASSWORD",
] as const;

export function missingStrapiEnvironment(
  env: Record<string, string>,
): string[] {
  return STRAPI_ENVIRONMENT.filter((key) => !env[key]);
}

const DIRECTUS_ENVIRONMENT = [
  "DIRECTUS_URL",
  "DIRECTUS_TOKEN",
  "DIRECTUS_SECRET",
  "DB_USER",
  "DB_PASSWORD",
  "DB_DATABASE",
] as const;

export function missingDirectusEnvironment(
  env: Record<string, string>,
): string[] {
  return DIRECTUS_ENVIRONMENT.filter((key) => !env[key]);
}

export function hasBuildScript(packageJson: unknown): boolean {
  if (!packageJson || typeof packageJson !== "object") return false;
  const scripts = (packageJson as { scripts?: unknown }).scripts;
  return (
    typeof scripts === "object" &&
    scripts !== null &&
    typeof (scripts as Record<string, unknown>).build === "string"
  );
}

export async function runDoctor(cwd: string): Promise<void> {
  const manifestPath = join(cwd, "astro-launchpad.json");
  let manifest: LaunchpadManifest;
  try {
    manifest = JSON.parse(
      await readFile(manifestPath, "utf8"),
    ) as LaunchpadManifest;
  } catch {
    p.log.error(
      "astro-launchpad.json not found. Run doctor from the root of a scaffolded project.",
    );
    process.exitCode = 1;
    return;
  }

  const { features } = manifest;
  const issues: Issue[] = [];

  // Node version
  if (!meetsNodeRequirement(process.version, NODE_REQUIREMENT)) {
    issues.push({
      message: `Node.js ${process.version} is below the required ${NODE_REQUIREMENT}.`,
      fix: `Upgrade Node.js to ${NODE_REQUIREMENT} or later (https://nodejs.org).`,
    });
  }

  // Package manager
  const pm = await inferPackageManager(cwd);
  const pmAvailable = await isCommandAvailable(pm);
  if (!pmAvailable) {
    issues.push({
      message: `Package manager "${pm}" was not found.`,
      fix: `Install ${pm} (https://nodejs.org/en/download/package-manager).`,
    });
  }

  // Docker
  if (features.docker || isServerCms(features.cms)) {
    const dockerOk = await isDockerRunning();
    if (!dockerOk) {
      issues.push({
        message: "Docker is not running or not installed.",
        fix: "Install Docker Desktop or start the Docker daemon.",
      });
    }
  }

  // Env vars (CMS)
  let dotEnv: Record<string, string> = {};
  if (features.cms === "directus") {
    try {
      dotEnv = parseDotEnv(await readFile(join(cwd, ".env"), "utf8"));
    } catch {
      // .env missing — will be caught by required-vars check below
    }
    const missing = missingDirectusEnvironment(dotEnv);
    if (missing.length > 0) {
      issues.push({
        message: `Missing required environment variable(s): ${missing.join(", ")}.`,
        fix: "Copy .env.example to .env and fill in the missing values.",
      });
    }
  }
  if (features.cms === "strapi") {
    try {
      dotEnv = parseDotEnv(await readFile(join(cwd, ".env"), "utf8"));
    } catch {
      // .env missing — will be caught by required-vars check below
    }
    const missing = missingStrapiEnvironment(dotEnv);
    if (missing.length > 0) {
      issues.push({
        message: `Missing required environment variable(s): ${missing.join(", ")}.`,
        fix: "Copy .env.example to .env and fill in the missing values.",
      });
    }
  }

  // Port 4321 (Astro dev server)
  const portFree = await isPortFree(4321);
  if (!portFree) {
    issues.push({
      message: "Port 4321 is already in use (Astro dev server port).",
      fix: "Stop the process occupying port 4321 before starting the dev server.",
    });
  }

  // Generated project build configuration
  try {
    await access(join(cwd, "astro.config.mjs"));
    const packageJson = JSON.parse(
      await readFile(join(cwd, "package.json"), "utf8"),
    ) as unknown;
    if (!hasBuildScript(packageJson)) {
      issues.push({
        message: 'package.json does not define a "build" script.',
        fix: 'Add "build": "astro build" to package.json scripts.',
      });
    }
  } catch {
    issues.push({
      message: "Astro build configuration is missing or invalid.",
      fix: "Restore astro.config.mjs and a valid package.json from the project template.",
    });
  }

  // CMS connection (Directus)
  if (features.cms === "directus") {
    const directusUrl = dotEnv["DIRECTUS_URL"] ?? "http://localhost:8055";
    const status = await fetchHttpStatus(`${directusUrl}/server/health`);
    if (status < 200 || status >= 300) {
      issues.push({
        message: `Cannot reach Directus at ${directusUrl}.`,
        fix: "Run `docker compose up -d` in the project directory.",
      });
    } else {
      const collections = ["pages", "sections", "site_settings"];
      const token = dotEnv["DIRECTUS_TOKEN"];
      const collectionStatuses = await Promise.all(
        collections.map((collection) =>
          fetchHttpStatus(`${directusUrl}/items/${collection}?limit=1`, {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          }),
        ),
      );
      const missingCollections = collections.filter(
        (_, index) =>
          collectionStatuses[index] < 200 || collectionStatuses[index] >= 300,
      );
      if (missingCollections.length > 0) {
        issues.push({
          message: `Cannot verify Directus collection(s): ${missingCollections.join(", ")}.`,
          fix: "Apply the bundled Directus schema and check DIRECTUS_TOKEN permissions.",
        });
      }
    }
  }

  // CMS connection (Strapi)
  if (features.cms === "strapi") {
    const strapiUrl = dotEnv["STRAPI_URL"] ?? "http://localhost:1337";
    const healthStatus = await fetchHttpStatus(`${strapiUrl}/_health`);
    if (healthStatus !== 204) {
      issues.push({
        message: `Cannot reach Strapi at ${strapiUrl} (got ${healthStatus}, expected 204).`,
        fix: "Run `docker compose up -d` in the project directory.",
      });
    } else {
      const token = dotEnv["STRAPI_TOKEN"];
      const pagesStatus = await fetchHttpStatus(
        `${strapiUrl}/api/pages?pagination[limit]=1`,
        token ? { Authorization: `Bearer ${token}` } : {},
      );
      if (pagesStatus < 200 || pagesStatus >= 300) {
        issues.push({
          message: `Cannot query Strapi /api/pages (got ${pagesStatus}).`,
          fix: "Check STRAPI_TOKEN has read-only API access.",
        });
      }
    }
  }

  for (const issue of issues) {
    p.log.warn(`${issue.message}\n  Fix: ${issue.fix}`);
  }

  if (issues.length === 0) {
    p.outro("All checks passed.");
  } else {
    p.outro(
      `Found ${issues.length} issue${issues.length === 1 ? "" : "s"}. See above for suggested fixes.`,
    );
    process.exitCode = 1;
  }
}

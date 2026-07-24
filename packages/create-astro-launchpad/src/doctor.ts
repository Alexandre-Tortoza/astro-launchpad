import { access, readFile } from "node:fs/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { createServer } from "node:net";
import { join } from "node:path";
import { spawn } from "node:child_process";
import * as p from "@clack/prompts";
import type { LaunchpadManifest, PackageManager } from "./types.js";

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

function fetchHttpStatus(url: string): Promise<number> {
  return new Promise((resolve) => {
    const requester = url.startsWith("https://") ? httpsRequest : httpRequest;
    const req = requester(url, { timeout: 5000 }, (res) => {
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
  if (features.docker || features.cms === "directus") {
    const dockerOk = await isDockerRunning();
    if (!dockerOk) {
      issues.push({
        message: "Docker is not running or not installed.",
        fix: "Install Docker Desktop or start the Docker daemon.",
      });
    }
  }

  // Env vars (Directus)
  let dotEnv: Record<string, string> = {};
  if (features.cms === "directus") {
    try {
      dotEnv = parseDotEnv(await readFile(join(cwd, ".env"), "utf8"));
    } catch {
      // .env missing — will be caught by required-vars check below
    }
    const required = [
      "DIRECTUS_URL",
      "DIRECTUS_SECRET",
      "DB_USER",
      "DB_PASSWORD",
      "DB_DATABASE",
    ];
    const missing = required.filter((k) => !dotEnv[k]);
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

  // CMS connection (Directus)
  if (features.cms === "directus") {
    const directusUrl = dotEnv["DIRECTUS_URL"] ?? "http://localhost:8055";
    const status = await fetchHttpStatus(`${directusUrl}/server/health`);
    if (status < 200 || status >= 300) {
      issues.push({
        message: `Cannot reach Directus at ${directusUrl}.`,
        fix: "Run `docker compose up -d` in the project directory.",
      });
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

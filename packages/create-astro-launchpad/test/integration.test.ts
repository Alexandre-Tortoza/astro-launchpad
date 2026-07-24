import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const packageDirectory = join(fileURLToPath(new URL("..", import.meta.url)));
const cliPath = join(packageDirectory, "dist/index.js");
const temporaryDirectories: string[] = [];

interface CliResult {
  exitCode: number;
  output: string;
}

function runCli(arguments_: string[], cwd: string): Promise<CliResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cliPath, ...arguments_], {
      cwd,
      stdio: "pipe",
    });
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      output += String(chunk);
    });
    child.once("error", reject);
    child.once("close", (code) => {
      resolve({ exitCode: code ?? 1, output });
    });
  });
}

async function expectSuccessfulCli(
  arguments_: string[],
  cwd: string,
): Promise<CliResult> {
  const result = await runCli(arguments_, cwd);
  expect(result.exitCode, result.output).toBe(0);
  return result;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("built CLI", () => {
  it("applies coherent Markdown content and placeholder assets for every preset", async () => {
    const temporaryDirectory = await mkdtemp(
      join(tmpdir(), "create-astro-launchpad-presets-"),
    );
    temporaryDirectories.push(temporaryDirectory);

    const presets = [
      ["minimal", "Astro Launchpad"],
      ["saas", "CloudPilot"],
      ["agency", "Northstar Studio"],
      ["local-business", "Juniper Bakery"],
      ["portfolio", "Elena Park"],
      ["waitlist", "Relay"],
      ["event", "Future Form"],
    ] as const;

    for (const [preset, siteName] of presets) {
      const destination = join(temporaryDirectory, preset);
      await expectSuccessfulCli(
        [
          destination,
          "--preset",
          preset,
          "--yes",
          "--skip-install",
          "--no-git",
        ],
        temporaryDirectory,
      );

      await expect(
        readFile(join(destination, "src/content/pages/home.md"), "utf8"),
      ).resolves.toContain(`title: ${siteName}`);
      if (preset !== "minimal") {
        await expect(
          stat(join(destination, "public/preset-hero.svg")),
        ).resolves.toBeDefined();
      }
    }
  });

  it.each(["saas", "agency"])(
    "connects the %s preset to the Directus content provider",
    async (preset) => {
      const temporaryDirectory = await mkdtemp(
        join(tmpdir(), "create-astro-launchpad-directus-"),
      );
      temporaryDirectories.push(temporaryDirectory);
      const destination = join(temporaryDirectory, preset);

      await expectSuccessfulCli(
        [
          destination,
          "--preset",
          preset,
          "--cms",
          "directus",
          "--yes",
          "--skip-install",
          "--no-git",
        ],
        temporaryDirectory,
      );

      await expect(
        readFile(join(destination, "src/lib/content/index.ts"), "utf8"),
      ).resolves.toContain("process.env.DIRECTUS_TOKEN");
      const packageJson = JSON.parse(
        await readFile(join(destination, "package.json"), "utf8"),
      );
      expect(packageJson.dependencies["@directus/sdk"]).toBe("^17.0.0");
      expect(packageJson.scripts["cms:setup"]).toBe(
        "bash scripts/setup-directus.sh",
      );
      expect(packageJson.scripts["cms:seed"]).toBe("tsx seed/seed.ts");
      expect(packageJson.scripts["cms:snapshot"]).toBe("tsx seed/snapshot.ts");
      await expect(
        readFile(join(destination, ".dockerignore"), "utf8"),
      ).resolves.toContain(".env");
      await expect(
        readFile(join(destination, "compose.yml"), "utf8"),
      ).resolves.toContain("directus-init:");
      await expect(
        readFile(join(destination, ".env"), "utf8"),
      ).resolves.toMatch(/^DIRECTUS_TOKEN=.+$/m);
    },
  );

  it("copies the base template and persists requested placeholders", async () => {
    const temporaryDirectory = await mkdtemp(
      join(tmpdir(), "create-astro-launchpad-"),
    );
    temporaryDirectories.push(temporaryDirectory);
    const destination = join(temporaryDirectory, "site");

    await expectSuccessfulCli(
      [
        destination,
        "--name",
        "Client Site",
        "--preset",
        "agency",
        "--no-tailwind",
        "--cms",
        "directus",
        "--blog",
        "--motion",
        "--docker",
        "--ai-kit",
        "--package-manager",
        "npm",
        "--skip-install",
        "--no-git",
        "--yes",
      ],
      temporaryDirectory,
    );

    await expect(
      stat(join(destination, "src/pages/index.astro")),
    ).resolves.toBeDefined();
    await expect(stat(join(destination, "LICENSE"))).resolves.toBeDefined();
    await expect(
      stat(join(destination, "prompts/generate-landing.md")),
    ).resolves.toBeDefined();
    await expect(
      stat(join(destination, "skills/codex.md")),
    ).resolves.toBeDefined();
    await expect(
      stat(join(destination, "schemas/page.schema.json")),
    ).resolves.toBeDefined();
    await expect(
      stat(join(destination, "examples/saas-landing.md")),
    ).resolves.toBeDefined();
    await expect(stat(join(destination, "Dockerfile"))).resolves.toBeDefined();
    await expect(
      readFile(join(destination, ".dockerignore"), "utf8"),
    ).resolves.toContain("node_modules");
    await expect(
      stat(join(destination, "src/pages/blog/index.astro")),
    ).resolves.toBeDefined();
    await expect(
      stat(join(destination, "src/components/motion/Fade.astro")),
    ).resolves.toBeDefined();
    await expect(
      readFile(join(destination, "src/pages/blog/index.astro"), "utf8"),
    ).resolves.toContain("contentProvider");
    await expect(
      readFile(join(destination, "compose.dev.yml"), "utf8"),
    ).resolves.toContain("target: dev");
    await expect(
      readFile(join(destination, "compose.prod.yml"), "utf8"),
    ).resolves.toContain("target: runner");
    await expect(
      readFile(join(destination, "Dockerfile"), "utf8"),
    ).resolves.toContain("COPY package.json package-lock.json ./");
    await expect(
      readFile(join(destination, "Dockerfile"), "utf8"),
    ).resolves.toContain("RUN npm ci");
    await expect(stat(join(destination, ".env"))).resolves.toBeDefined();
    await expect(
      readFile(join(destination, "astro.config.mjs"), "utf8"),
    ).resolves.toContain('output: "server"');
    await expect(stat(join(destination, "node_modules"))).rejects.toMatchObject(
      { code: "ENOENT" },
    );

    const packageJson = JSON.parse(
      await readFile(join(destination, "package.json"), "utf8"),
    );
    expect(packageJson.name).toBe("client-site");
    expect(packageJson.private).toBe(true);
    expect(packageJson.dependencies["@astrojs/rss"]).toBe("^4.0.0");

    const manifest = JSON.parse(
      await readFile(join(destination, "astro-launchpad.json"), "utf8"),
    );
    expect(manifest).toEqual({
      preset: "agency",
      features: {
        tailwind: false,
        cms: "directus",
        blog: true,
        motion: true,
        docker: true,
        aiKit: true,
      },
    });
  });

  it("writes pnpm build approvals when pnpm is selected", async () => {
    const temporaryDirectory = await mkdtemp(
      join(tmpdir(), "create-astro-launchpad-"),
    );
    temporaryDirectories.push(temporaryDirectory);
    const destination = join(temporaryDirectory, "site");

    await expectSuccessfulCli(
      [destination, "--yes", "--skip-install", "--no-git"],
      temporaryDirectory,
    );

    expect(
      await readFile(join(destination, "pnpm-workspace.yaml"), "utf8"),
    ).toBe("allowBuilds:\n  esbuild: true\n  sharp: true\n");
    await expect(
      readFile(join(destination, "astro.config.mjs"), "utf8"),
    ).resolves.toContain("@tailwindcss/vite");
    const packageJson = JSON.parse(
      await readFile(join(destination, "package.json"), "utf8"),
    );
    expect(packageJson.dependencies.tailwindcss).toBe("^4.0.0");
    expect(packageJson.scripts).toMatchObject({
      lint: "eslint .",
      typecheck: "astro sync && tsc --noEmit",
      format: "prettier --write .",
      "launchpad:doctor": "npx create-astro-launchpad doctor",
      check: "pnpm lint && pnpm typecheck && pnpm build",
    });
  });

  it.each([
    [
      "pnpm",
      "pnpm-lock.yaml pnpm-workspace.yaml",
      "pnpm install --frozen-lockfile",
    ],
    ["npm", "package-lock.json", "npm ci"],
    ["yarn", "yarn.lock", "yarn install --frozen-lockfile"],
    ["bun", "bun.lock", "bun install --frozen-lockfile"],
  ] as const)(
    "materializes Docker for %s",
    async (packageManager, lockfile, installCommand) => {
      const temporaryDirectory = await mkdtemp(
        join(tmpdir(), "create-astro-launchpad-docker-"),
      );
      temporaryDirectories.push(temporaryDirectory);
      const destination = join(temporaryDirectory, packageManager);

      await expectSuccessfulCli(
        [
          destination,
          "--docker",
          "--package-manager",
          packageManager,
          "--yes",
          "--skip-install",
          "--no-git",
        ],
        temporaryDirectory,
      );

      const dockerfile = await readFile(
        join(destination, "Dockerfile"),
        "utf8",
      );
      expect(dockerfile).toContain(`COPY package.json ${lockfile} ./`);
      expect(dockerfile).toContain(`RUN ${installCommand}`);
      await expect(
        readFile(join(destination, "compose.dev.yml"), "utf8"),
      ).resolves.toContain("web_astro:/app/.astro");
      await expect(
        stat(join(destination, "compose.dev.yml")),
      ).resolves.toBeDefined();
      await expect(
        stat(join(destination, "compose.prod.yml")),
      ).resolves.toBeDefined();
    },
  );

  it("supports help and version without creating a project", async () => {
    const temporaryDirectory = await mkdtemp(
      join(tmpdir(), "create-astro-launchpad-"),
    );
    temporaryDirectories.push(temporaryDirectory);

    const help = await expectSuccessfulCli(["--help"], temporaryDirectory);
    const version = await expectSuccessfulCli(
      ["--version"],
      temporaryDirectory,
    );

    expect(help.output).toContain("Usage: create-astro-launchpad");
    expect(version.output).toMatch(/\d+\.\d+\.\d+/);
  });

  it("shows the project plan without writing files when dry-running", async () => {
    const temporaryDirectory = await mkdtemp(
      join(tmpdir(), "create-astro-launchpad-"),
    );
    temporaryDirectories.push(temporaryDirectory);
    const destination = join(temporaryDirectory, "site");

    const result = await expectSuccessfulCli(
      [
        destination,
        "--package-manager",
        "npm",
        "--skip-install",
        "--no-git",
        "--yes",
        "--dry-run",
      ],
      temporaryDirectory,
    );

    expect(result.output).toContain("Dry run: no files will be created.");
    expect(result.output).toContain(`Destination: ${destination}`);
    expect(result.output).toContain("Install dependencies: skipped");
    await expect(stat(destination)).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("creates projects in paths containing spaces", async () => {
    const temporaryDirectory = await mkdtemp(
      join(tmpdir(), "create astro launchpad-"),
    );
    temporaryDirectories.push(temporaryDirectory);
    const destination = join(temporaryDirectory, "client site");

    await expectSuccessfulCli(
      [destination, "--yes", "--skip-install", "--no-git"],
      temporaryDirectory,
    );

    await expect(
      stat(join(destination, "package.json")),
    ).resolves.toBeDefined();
  });

  it("rejects invalid arguments without scaffolding a project", async () => {
    const temporaryDirectory = await mkdtemp(
      join(tmpdir(), "create-astro-launchpad-"),
    );
    temporaryDirectories.push(temporaryDirectory);

    const unknownOption = await runCli(
      ["site", "--unknown-option", "--yes"],
      temporaryDirectory,
    );
    const multipleDirectories = await runCli(
      ["site", "another-site", "--yes"],
      temporaryDirectory,
    );
    const debug = await runCli(
      ["site", "--unknown-option", "--debug", "--yes"],
      temporaryDirectory,
    );

    expect(unknownOption.exitCode).not.toBe(0);
    expect(unknownOption.output).toContain("Unknown option: --unknown-option");
    expect(unknownOption.output).toContain("create-astro-launchpad --help");
    expect(debug.output).toContain("Error: Unknown option: --unknown-option");
    expect(multipleDirectories.exitCode).not.toBe(0);
    expect(multipleDirectories.output).toContain(
      "Only one destination directory can be specified.",
    );
    await expect(stat(join(temporaryDirectory, "site"))).rejects.toMatchObject({
      code: "ENOENT",
    });
  });

  it("reports a clear error when doctor is run outside a generated project", async () => {
    const temporaryDirectory = await mkdtemp(
      join(tmpdir(), "create-astro-launchpad-"),
    );
    temporaryDirectories.push(temporaryDirectory);

    const result = await runCli(["doctor"], temporaryDirectory);

    expect(result.exitCode).not.toBe(0);
    expect(result.output).toContain("astro-launchpad.json not found");
  });

  it("protects non-empty destinations from being overwritten", async () => {
    const temporaryDirectory = await mkdtemp(
      join(tmpdir(), "create-astro-launchpad-"),
    );
    temporaryDirectories.push(temporaryDirectory);
    const destination = join(temporaryDirectory, "site");
    await mkdir(destination);
    await writeFile(join(destination, "keep.txt"), "keep");

    const result = await runCli(
      [destination, "--yes", "--skip-install", "--no-git"],
      temporaryDirectory,
    );

    expect(result.exitCode).not.toBe(0);
    expect(result.output).toContain("Destination directory is not empty");
    await expect(readFile(join(destination, "keep.txt"), "utf8")).resolves.toBe(
      "keep",
    );
  });
});

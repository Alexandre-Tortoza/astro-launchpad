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
    await expect(stat(join(destination, "node_modules"))).rejects.toMatchObject(
      { code: "ENOENT" },
    );

    const packageJson = JSON.parse(
      await readFile(join(destination, "package.json"), "utf8"),
    );
    expect(packageJson.name).toBe("client-site");
    expect(packageJson.private).toBe(true);

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
  });

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

    expect(unknownOption.exitCode).not.toBe(0);
    expect(unknownOption.output).toContain("Unknown option: --unknown-option");
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

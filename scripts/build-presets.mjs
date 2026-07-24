import { cp, mkdir, readdir, rm, symlink } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { basename, dirname, join, resolve } from "node:path";

const repositoryDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);
const baseDirectory = join(repositoryDirectory, "templates", "base");
const presetsDirectory = join(repositoryDirectory, "templates", "presets");
const outputDirectory = join(
  repositoryDirectory,
  "templates",
  ".preset-builds",
);
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const presets = await readdir(presetsDirectory, { withFileTypes: true });

try {
  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });

  for (const preset of presets.filter((entry) => entry.isDirectory())) {
    const presetDirectory = join(presetsDirectory, preset.name);
    const destination = join(outputDirectory, preset.name);
    await cp(baseDirectory, destination, {
      recursive: true,
      filter(source) {
        return !["node_modules", ".astro", "dist", ".preset-builds"].includes(
          basename(source),
        );
      },
    });
    await cp(presetDirectory, destination, {
      recursive: true,
      filter(source) {
        return !["package.json", "node_modules", ".astro", "dist"].includes(
          basename(source),
        );
      },
    });
    await symlink(
      join(baseDirectory, "node_modules"),
      join(destination, "node_modules"),
      process.platform === "win32" ? "junction" : "dir",
    );

    const result = spawnSync(pnpm, ["--dir", destination, "build"], {
      cwd: repositoryDirectory,
      stdio: "inherit",
    });
    if (result.status !== 0) {
      throw new Error(`Preset "${preset.name}" failed to build.`);
    }
  }
} finally {
  await rm(outputDirectory, { recursive: true, force: true });
}

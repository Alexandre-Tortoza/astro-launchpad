import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const packageDirectory = new URL(
  "../packages/create-astro-launchpad/",
  import.meta.url,
);
const temporaryDirectory = await mkdtemp(
  join(tmpdir(), "astro-launchpad-pack-"),
);
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
let packagePath;

function run(command, arguments_, options = {}) {
  const result = spawnSync(command, arguments_, {
    stdio: "inherit",
    ...options,
  });
  if (result.status !== 0)
    throw new Error(`${command} exited with ${result.status ?? 1}.`);
}

try {
  const packed = spawnSync(npm, ["pack", "--json"], {
    cwd: packageDirectory,
    encoding: "utf8",
  });
  if (packed.status !== 0)
    throw new Error(`${npm} pack exited with ${packed.status ?? 1}.`);
  const [{ filename: packageName }] = JSON.parse(packed.stdout);
  packagePath = new URL(packageName, packageDirectory);
  run(npm, ["install", "--ignore-scripts", fileURLToPath(packagePath)], {
    cwd: temporaryDirectory,
  });
  const executable =
    process.platform === "win32"
      ? join(
          temporaryDirectory,
          "node_modules",
          ".bin",
          "create-astro-launchpad.cmd",
        )
      : join(
          temporaryDirectory,
          "node_modules",
          ".bin",
          "create-astro-launchpad",
        );
  run(executable, ["--version"], { cwd: temporaryDirectory });
  run(executable, ["--help"], { cwd: temporaryDirectory });
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
  if (packagePath) await rm(packagePath, { force: true });
}

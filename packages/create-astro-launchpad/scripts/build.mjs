import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { builtinModules } from "node:module";
import { fileURLToPath } from "node:url";
import { basename, dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { build } from "esbuild";

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryDirectory = resolve(packageDirectory, "../..");
const outputDirectory = resolve(packageDirectory, "dist");
const templateSource = resolve(repositoryDirectory, "templates/base");
const templateDestination = resolve(outputDirectory, "template/base");
const licenseSource = resolve(repositoryDirectory, "LICENSE");

const tsc = spawnSync("tsc", ["--noEmit"], {
  cwd: packageDirectory,
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (tsc.status !== 0) {
  process.exit(tsc.status ?? 1);
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

await build({
  entryPoints: [resolve(packageDirectory, "src/index.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  target: ["node22"],
  outfile: resolve(outputDirectory, "index.js"),
  external: [...builtinModules, ...builtinModules.map((m) => `node:${m}`)],
});

await mkdir(dirname(templateDestination), { recursive: true });
await cp(templateSource, templateDestination, {
  recursive: true,
  filter(source) {
    return !["node_modules", ".astro", "dist"].includes(basename(source));
  },
});
await cp(licenseSource, resolve(templateDestination, "LICENSE"));

const featuresSource = resolve(repositoryDirectory, "templates/features");
const featuresDestination = resolve(outputDirectory, "template/features");
const presetsSource = resolve(repositoryDirectory, "templates/presets");
const presetsDestination = resolve(outputDirectory, "template/presets");
const aiKitSource = resolve(repositoryDirectory, "packages/ai-kit");
await mkdir(featuresDestination, { recursive: true });
const packs = await readdir(featuresSource);
for (const pack of packs) {
  await cp(resolve(featuresSource, pack), resolve(featuresDestination, pack), {
    recursive: true,
    filter(source) {
      return !["node_modules", ".astro", "dist"].includes(basename(source));
    },
  });
}

await rm(presetsDestination, { recursive: true, force: true });
await cp(presetsSource, presetsDestination, {
  recursive: true,
  filter(source) {
    return !["package.json", "node_modules", ".astro", "dist"].includes(
      basename(source),
    );
  },
});

const aiKitDestination = resolve(featuresDestination, "ai-kit");
for (const directory of ["prompts", "skills", "schemas", "examples"]) {
  await cp(
    resolve(aiKitSource, directory),
    resolve(aiKitDestination, directory),
    { recursive: true },
  );
}

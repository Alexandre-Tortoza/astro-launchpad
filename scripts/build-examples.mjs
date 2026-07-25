import { rm, unlink } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const repositoryDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);
const cliPath = join(
  repositoryDirectory,
  "packages/create-astro-launchpad/dist/index.js",
);
const examplesDirectory = join(repositoryDirectory, "examples");
const node = process.execPath;

const examples = [
  {
    name: "landing-markdown",
    args: [
      "--preset",
      "saas",
      "--cms",
      "markdown",
      "--yes",
      "--skip-install",
      "--no-git",
    ],
  },
  {
    name: "landing-directus",
    args: [
      "--preset",
      "saas",
      "--cms",
      "directus",
      "--yes",
      "--skip-install",
      "--no-git",
    ],
  },
  {
    name: "landing-strapi",
    args: [
      "--preset",
      "saas",
      "--cms",
      "strapi",
      "--yes",
      "--skip-install",
      "--no-git",
    ],
  },
];

for (const example of examples) {
  const destination = join(examplesDirectory, example.name);
  await rm(destination, { recursive: true, force: true });

  console.log(`Generating examples/${example.name}...`);
  const result = spawnSync(node, [cliPath, destination, ...example.args], {
    cwd: examplesDirectory,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`Failed to generate examples/${example.name}`);
  }

  // Remove .env — it contains generated secrets not suitable for version control
  await unlink(join(destination, ".env")).catch(() => {});
}

console.log("Done. Copy .env.example to .env in each example before running.");

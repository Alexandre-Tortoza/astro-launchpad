import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import type { LaunchpadManifest, ProjectOptions } from "./types.js";

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

async function addPackDependencies(
  packageJson: Record<string, unknown>,
  packDirectory: string,
): Promise<void> {
  const pack = JSON.parse(
    await readFile(join(packDirectory, "package.json"), "utf8"),
  ) as { dependencies?: Record<string, string> };
  if (!pack.dependencies) return;

  const dependencies = (packageJson.dependencies ?? {}) as Record<
    string,
    string
  >;
  Object.assign(dependencies, pack.dependencies);
  packageJson.dependencies = dependencies;
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
  ]) {
    if (feature)
      await addPackDependencies(packageJson, join(featuresDirectory, feature));
  }

  if (options.features.cms === "directus") {
    const dependencies = (packageJson.dependencies ?? {}) as Record<
      string,
      string
    >;
    dependencies["@directus/sdk"] = "^17.0.0";
    packageJson.dependencies = dependencies;
  }
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
  }
}

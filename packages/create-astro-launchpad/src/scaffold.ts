import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import type { LaunchpadManifest, ProjectOptions } from './types.js';

const excludedTemplateDirectories = new Set(['node_modules', '.astro', 'dist']);

export async function ensureEmptyDestination(destination: string): Promise<void> {
  try {
    const entries = await readdir(destination);
    if (entries.length > 0) throw new Error(`Destination directory is not empty: ${destination}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await mkdir(destination, { recursive: true });
      return;
    }
    throw error;
  }
}

export async function scaffoldProject(templateDirectory: string, options: ProjectOptions): Promise<void> {
  await ensureEmptyDestination(options.destination);
  await cp(templateDirectory, options.destination, {
    recursive: true,
    filter(source) {
      return !excludedTemplateDirectories.has(basename(source));
    },
  });

  const packagePath = join(options.destination, 'package.json');
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8')) as Record<string, unknown>;
  packageJson.name = options.projectName;
  packageJson.private = true;
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

  const manifest: LaunchpadManifest = { preset: options.preset, features: options.features };
  await writeFile(join(options.destination, 'astro-launchpad.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  if (options.packageManager === 'pnpm') {
    await writeFile(join(options.destination, 'pnpm-workspace.yaml'), 'allowBuilds:\n  esbuild: true\n  sharp: true\n');
  }
}

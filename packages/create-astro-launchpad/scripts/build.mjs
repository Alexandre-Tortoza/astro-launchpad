import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { basename, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryDirectory = resolve(packageDirectory, '../..');
const outputDirectory = resolve(packageDirectory, 'dist');
const templateSource = resolve(repositoryDirectory, 'templates/base');
const templateDestination = resolve(outputDirectory, 'template/base');

const tsc = spawnSync('tsc', { cwd: packageDirectory, stdio: 'inherit', shell: process.platform === 'win32' });
if (tsc.status !== 0) {
  process.exit(tsc.status ?? 1);
}

await rm(templateDestination, { recursive: true, force: true });
await mkdir(dirname(templateDestination), { recursive: true });
await cp(templateSource, templateDestination, {
  recursive: true,
  filter(source) {
    return !['node_modules', '.astro', 'dist'].includes(basename(source));
  },
});

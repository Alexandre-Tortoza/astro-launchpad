import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const packageDirectory = join(fileURLToPath(new URL('..', import.meta.url)));
const cliPath = join(packageDirectory, 'dist/index.js');
const temporaryDirectories: string[] = [];

function runCli(arguments_: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cliPath, ...arguments_], { cwd, stdio: 'pipe' });
    let output = '';
    child.stdout.on('data', (chunk) => { output += String(chunk); });
    child.stderr.on('data', (chunk) => { output += String(chunk); });
    child.once('error', reject);
    child.once('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`CLI exited with ${code}: ${output}`));
    });
  });
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe('built CLI', () => {
  it('copies the base template and persists requested placeholders', async () => {
    const temporaryDirectory = await mkdtemp(join(tmpdir(), 'create-astro-launchpad-'));
    temporaryDirectories.push(temporaryDirectory);
    const destination = join(temporaryDirectory, 'site');

    await runCli([
      destination,
      '--name', 'Client Site',
      '--preset', 'agency',
      '--no-tailwind',
      '--cms', 'directus',
      '--blog',
      '--motion',
      '--docker',
      '--ai-kit',
      '--package-manager', 'npm',
      '--skip-install',
      '--no-git',
      '--yes',
    ], temporaryDirectory);

    await expect(stat(join(destination, 'src/pages/index.astro'))).resolves.toBeDefined();
    await expect(stat(join(destination, 'node_modules'))).rejects.toMatchObject({ code: 'ENOENT' });

    const packageJson = JSON.parse(await readFile(join(destination, 'package.json'), 'utf8'));
    expect(packageJson.name).toBe('client-site');
    expect(packageJson.private).toBe(true);

    const manifest = JSON.parse(await readFile(join(destination, 'astro-launchpad.json'), 'utf8'));
    expect(manifest).toEqual({
      preset: 'agency',
      features: { tailwind: false, cms: 'directus', blog: true, motion: true, docker: true, aiKit: true },
    });
  });

  it('writes pnpm build approvals when pnpm is selected', async () => {
    const temporaryDirectory = await mkdtemp(join(tmpdir(), 'create-astro-launchpad-'));
    temporaryDirectories.push(temporaryDirectory);
    const destination = join(temporaryDirectory, 'site');

    await runCli([destination, '--yes', '--skip-install', '--no-git'], temporaryDirectory);

    expect(await readFile(join(destination, 'pnpm-workspace.yaml'), 'utf8')).toBe('allowBuilds:\n  esbuild: true\n  sharp: true\n');
  });
});

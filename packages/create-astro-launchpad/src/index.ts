#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { createRequire } from "node:module";
import * as p from "@clack/prompts";
import { helpText, parseCliArguments } from "./options.js";
import { collectOptions } from "./prompts.js";
import { developmentCommand, installCommand, runCommand } from "./process.js";
import { scaffoldProject } from "./scaffold.js";

export async function run(
  arguments_: string[],
  currentDirectory = process.cwd(),
  moduleUrl = import.meta.url,
): Promise<void> {
  const flags = parseCliArguments(arguments_);
  if (flags.version) {
    const require = createRequire(moduleUrl);
    const { version } = require("../package.json") as { version: string };
    console.log(version);
    return;
  }
  if (flags.help) {
    console.log(helpText);
    return;
  }

  const options = await collectOptions(flags, currentDirectory);
  const templateDirectory = join(
    dirname(fileURLToPath(moduleUrl)),
    "template",
    "base",
  );
  await scaffoldProject(templateDirectory, options);

  if (options.install) {
    const install = installCommand(options.packageManager);
    p.log.step(`Installing dependencies with ${options.packageManager}...`);
    const exitCode = await runCommand(
      install.command,
      install.arguments,
      options.destination,
    );
    if (exitCode !== 0)
      throw new Error(
        `Dependency installation failed with exit code ${exitCode}.`,
      );
  }

  if (options.initializeGit) {
    const exitCode = await runCommand(
      "git",
      ["init"],
      options.destination,
    ).catch(() => 1);
    if (exitCode !== 0)
      p.log.warn(
        "Git initialization was skipped because Git is unavailable or failed.",
      );
  }

  p.outro(
    `Project created in ${options.destination}\n\nNext steps:\n  cd ${options.destination}\n  ${developmentCommand(options.packageManager)}`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run(process.argv.slice(2)).catch((error: unknown) => {
    p.log.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}

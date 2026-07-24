#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { createRequire } from "node:module";
import * as p from "@clack/prompts";
import { helpText, parseCliArguments } from "./options.js";
import { collectOptions } from "./prompts.js";
import { developmentCommand, installCommand, runCommand } from "./process.js";
import { scaffoldProject } from "./scaffold.js";
import { runDoctor } from "./doctor.js";

function errorMessage(error: unknown, debug: boolean): string {
  const message = error instanceof Error ? error.message : String(error);
  const details = debug && error instanceof Error ? `\n\n${error.stack}` : "";
  return `${message}\n\nNext step: run create-astro-launchpad --help for available options.${details}`;
}

export async function run(
  arguments_: string[],
  currentDirectory = process.cwd(),
  moduleUrl = import.meta.url,
): Promise<void> {
  if (arguments_[0] === "doctor") {
    await runDoctor(currentDirectory);
    return;
  }
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
  if (flags.dryRun) {
    const install = installCommand(options.packageManager);
    p.log.info(
      `Dry run: no files will be created.\n\n` +
        `Destination: ${options.destination}\n` +
        `Project name: ${options.projectName}\n` +
        `Preset: ${options.preset}\n` +
        `CMS: ${options.features.cms}\n` +
        `Install dependencies: ${options.install ? `${install.command} ${install.arguments.join(" ")}` : "skipped"}\n` +
        `Initialize Git: ${options.initializeGit ? "yes" : "no"}`,
    );
    return;
  }
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

  const runScript =
    options.packageManager === "npm"
      ? "npm run"
      : options.packageManager === "bun"
        ? "bun run"
        : options.packageManager;
  const nextSteps =
    options.features.cms === "directus"
      ? `cd ${options.destination}\n  ${runScript} cms:setup\n  ${runScript} docker:dev`
      : `cd ${options.destination}\n  ${developmentCommand(options.packageManager)}`;
  p.outro(
    `Project created in ${options.destination}\n\nNext steps:\n  ${nextSteps}`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run(process.argv.slice(2)).catch((error: unknown) => {
    console.error(errorMessage(error, process.argv.includes("--debug")));
    process.exitCode = 1;
  });
}

import { basename, resolve } from "node:path";
import type { Cms, PackageManager, Preset, ProjectOptions } from "./types.js";
import { CMS_OPTIONS, PACKAGE_MANAGERS, PRESETS } from "./types.js";

export interface CliFlags {
  directory?: string;
  name?: string;
  preset?: Preset;
  tailwind?: boolean;
  cms?: Cms;
  blog?: boolean;
  motion?: boolean;
  docker?: boolean;
  aiKit?: boolean;
  packageManager?: PackageManager;
  install?: boolean;
  initializeGit?: boolean;
  yes: boolean;
  help: boolean;
  version: boolean;
  dryRun: boolean;
  debug: boolean;
}

const valueFlags = new Set(["name", "preset", "cms", "package-manager"]);
const booleanFlags: Record<string, keyof CliFlags> = {
  tailwind: "tailwind",
  blog: "blog",
  motion: "motion",
  docker: "docker",
  "ai-kit": "aiKit",
  install: "install",
  git: "initializeGit",
};

function assertChoice<T extends readonly string[]>(
  value: string,
  choices: T,
  flag: string,
): asserts value is T[number] {
  if (!choices.includes(value)) {
    throw new Error(
      `Invalid value for --${flag}: ${value}. Expected one of: ${choices.join(", ")}.`,
    );
  }
}

export function parseCliArguments(arguments_: string[]): CliFlags {
  const flags: CliFlags = {
    yes: false,
    help: false,
    version: false,
    dryRun: false,
    debug: false,
  };

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (!argument.startsWith("-")) {
      if (flags.directory)
        throw new Error("Only one destination directory can be specified.");
      flags.directory = argument;
      continue;
    }

    if (argument === "--yes" || argument === "-y") {
      flags.yes = true;
      continue;
    }
    if (argument === "--help" || argument === "-h") {
      flags.help = true;
      continue;
    }
    if (argument === "--version" || argument === "-v") {
      flags.version = true;
      continue;
    }
    if (argument === "--skip-install") {
      flags.install = false;
      continue;
    }
    if (argument === "--dry-run") {
      flags.dryRun = true;
      continue;
    }
    if (argument === "--debug") {
      flags.debug = true;
      continue;
    }

    const isNegative = argument.startsWith("--no-");
    const name = argument.slice(isNegative ? 5 : 2);
    if (valueFlags.has(name)) {
      if (isNegative) throw new Error(`--no-${name} is not supported.`);
      const value = arguments_[index + 1];
      if (!value || value.startsWith("--"))
        throw new Error(`--${name} requires a value.`);
      index += 1;
      if (name === "preset") {
        assertChoice(value, PRESETS, name);
        flags.preset = value;
      } else if (name === "cms") {
        assertChoice(value, CMS_OPTIONS, name);
        flags.cms = value;
      } else if (name === "package-manager") {
        assertChoice(value, PACKAGE_MANAGERS, name);
        flags.packageManager = value;
      } else {
        flags.name = value;
      }
      continue;
    }

    const key = booleanFlags[name];
    if (!key) throw new Error(`Unknown option: ${argument}`);
    flags[key] = !isNegative as never;
  }

  return flags;
}

export function toPackageName(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "astro-launchpad-app"
  );
}

export function defaultProjectName(directory?: string): string {
  return directory ? toPackageName(basename(directory)) : "astro-launchpad-app";
}

function detectedPackageManager(): PackageManager {
  const userAgent = process.env["npm_config_user_agent"] ?? "";
  if (userAgent.startsWith("npm/")) return "npm";
  if (userAgent.startsWith("yarn/")) return "yarn";
  if (userAgent.startsWith("bun/")) return "bun";
  return "pnpm";
}

export function defaultsFromFlags(
  flags: CliFlags,
  currentDirectory: string,
): ProjectOptions {
  const projectName = toPackageName(
    flags.name ?? defaultProjectName(flags.directory),
  );
  return {
    projectName,
    destination: resolve(currentDirectory, flags.directory ?? projectName),
    preset: flags.preset ?? "saas",
    features: {
      tailwind: flags.tailwind ?? true,
      cms: flags.cms ?? "markdown",
      blog: flags.blog ?? false,
      motion: flags.motion ?? false,
      docker: flags.docker ?? false,
      aiKit: flags.aiKit ?? false,
    },
    packageManager: flags.packageManager ?? detectedPackageManager(),
    install: flags.install ?? true,
    initializeGit: flags.initializeGit ?? true,
  };
}

export const helpText = `Usage: create-astro-launchpad [directory] [options]

Commands:
  doctor                          Check environment health for a scaffolded project

Options:
  --name <name>                   Project package name
  --preset <preset>               minimal, saas, agency, local-business, portfolio, waitlist, event
  --tailwind, --no-tailwind       Enable or disable Tailwind placeholder
  --cms <cms>                     markdown, directus, none
  --blog, --no-blog               Enable or disable blog placeholder
  --motion, --no-motion           Enable or disable Motion placeholder
  --docker, --no-docker           Enable or disable Docker placeholder
  --ai-kit, --no-ai-kit           Enable or disable ai-kit assets
  --package-manager <manager>     pnpm, npm, yarn, bun
  --install, --skip-install       Install dependencies or skip installation
  --git, --no-git                 Initialize Git or skip initialization
  -y, --yes                       Use defaults for values not provided
  --dry-run                       Show the project plan without writing files
  --debug                         Show a stack trace when a command fails
  -h, --help                      Show this help message
  -v, --version                   Show the installed version`;

import * as p from "@clack/prompts";
import { resolve } from "node:path";
import { defaultProjectName, toPackageName, type CliFlags } from "./options.js";
import type { ProjectOptions } from "./types.js";
import { CMS_OPTIONS, PACKAGE_MANAGERS, PRESETS } from "./types.js";

function requireAnswer<T>(answer: T | symbol): T {
  if (p.isCancel(answer)) {
    p.cancel("Project creation cancelled.");
    throw new Error("Project creation cancelled.");
  }
  return answer as T;
}

async function askBoolean(
  message: string,
  initialValue: boolean,
): Promise<boolean> {
  return requireAnswer(await p.confirm({ message, initialValue }));
}

export async function collectOptions(
  flags: CliFlags,
  currentDirectory: string,
): Promise<ProjectOptions> {
  const defaults = {
    projectName: toPackageName(
      flags.name ?? defaultProjectName(flags.directory),
    ),
    destination: resolve(
      currentDirectory,
      flags.directory ?? toPackageName(flags.name ?? "astro-launchpad-app"),
    ),
    preset: flags.preset ?? "saas",
    tailwind: flags.tailwind ?? true,
    cms: flags.cms ?? "markdown",
    blog: flags.blog ?? false,
    motion: flags.motion ?? false,
    docker: flags.docker ?? false,
    aiKit: flags.aiKit ?? false,
    packageManager: flags.packageManager ?? "pnpm",
    install: flags.install ?? true,
    initializeGit: flags.initializeGit ?? true,
  };

  if (flags.yes)
    return {
      ...defaults,
      features: {
        tailwind: defaults.tailwind,
        cms: defaults.cms,
        blog: defaults.blog,
        motion: defaults.motion,
        docker: defaults.docker,
        aiKit: defaults.aiKit,
      },
    };

  p.intro("Create an Astro Launchpad project");
  const projectName = flags.name
    ? defaults.projectName
    : toPackageName(
        requireAnswer(
          await p.text({
            message: "Project name:",
            initialValue: defaults.projectName,
            validate(value) {
              return toPackageName(value) === "astro-launchpad-app" &&
                value.trim() !== "astro-launchpad-app"
                ? "Enter a name containing letters or numbers."
                : undefined;
            },
          }),
        ),
      );
  const destination = flags.directory
    ? resolve(currentDirectory, flags.directory)
    : resolve(currentDirectory, projectName);
  const preset = flags.preset
    ? flags.preset
    : requireAnswer(
        await p.select({
          message: "Preset:",
          initialValue: defaults.preset,
          options: PRESETS.map((value) => ({ value, label: value })),
        }),
      );
  const tailwind =
    flags.tailwind ??
    (await askBoolean("Add Tailwind CSS placeholder?", defaults.tailwind));
  const cms = flags.cms
    ? flags.cms
    : requireAnswer(
        await p.select({
          message: "CMS:",
          initialValue: defaults.cms,
          options: CMS_OPTIONS.map((value) => ({ value, label: value })),
        }),
      );
  const blog =
    flags.blog ?? (await askBoolean("Add blog placeholder?", defaults.blog));
  const motion =
    flags.motion ??
    (await askBoolean("Add Motion placeholder?", defaults.motion));
  const docker =
    flags.docker ??
    (await askBoolean("Add Docker placeholder?", defaults.docker));
  const aiKit =
    flags.aiKit ?? (await askBoolean("Add ai-kit?", defaults.aiKit));
  const packageManager = flags.packageManager
    ? flags.packageManager
    : requireAnswer(
        await p.select({
          message: "Package manager:",
          initialValue: defaults.packageManager,
          options: PACKAGE_MANAGERS.map((value) => ({ value, label: value })),
        }),
      );
  const install =
    flags.install ??
    (await askBoolean("Install dependencies?", defaults.install));
  const initializeGit =
    flags.initializeGit ??
    (await askBoolean("Initialize a Git repository?", defaults.initializeGit));

  return {
    projectName,
    destination,
    preset,
    features: { tailwind, cms, blog, motion, docker, aiKit },
    packageManager,
    install,
    initializeGit,
  };
}

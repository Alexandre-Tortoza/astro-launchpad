export const PRESETS = [
  "minimal",
  "saas",
  "agency",
  "local-business",
  "portfolio",
  "waitlist",
  "event",
] as const;
export const CMS_OPTIONS = ["markdown", "directus", "none"] as const;
export const PACKAGE_MANAGERS = ["pnpm", "npm", "yarn", "bun"] as const;

export type Preset = (typeof PRESETS)[number];
export type Cms = (typeof CMS_OPTIONS)[number];
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export interface ProjectFeatures {
  tailwind: boolean;
  cms: Cms;
  blog: boolean;
  motion: boolean;
  docker: boolean;
  aiKit: boolean;
}

export interface ProjectOptions {
  projectName: string;
  destination: string;
  preset: Preset;
  features: ProjectFeatures;
  packageManager: PackageManager;
  install: boolean;
  initializeGit: boolean;
}

export interface LaunchpadManifest {
  preset: Preset;
  features: ProjectFeatures;
}

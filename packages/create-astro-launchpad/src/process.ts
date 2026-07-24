import { spawn } from "node:child_process";
import type { PackageManager } from "./types.js";

export function runCommand(
  command: string,
  arguments_: string[],
  cwd: string,
): Promise<number> {
  const executable =
    process.platform === "win32" &&
    ["pnpm", "npm", "yarn", "bun"].includes(command)
      ? `${command}.cmd`
      : command;
  return new Promise((resolve, reject) => {
    const child = spawn(executable, arguments_, {
      cwd,
      stdio: "inherit",
      shell: false,
    });
    child.once("error", reject);
    child.once("close", (code) => resolve(code ?? 1));
  });
}

export function installCommand(packageManager: PackageManager): {
  command: string;
  arguments: string[];
} {
  return { command: packageManager, arguments: ["install"] };
}

export function developmentCommand(packageManager: PackageManager): string {
  return packageManager === "npm" ? "npm run dev" : `${packageManager} dev`;
}

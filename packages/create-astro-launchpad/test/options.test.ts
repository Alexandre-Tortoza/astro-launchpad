import { describe, expect, it } from "vitest";
import {
  defaultsFromFlags,
  parseCliArguments,
  toPackageName,
} from "../src/options.js";
import { developmentCommand } from "../src/process.js";

describe("CLI options", () => {
  it("parses selections and negative flags", () => {
    const flags = parseCliArguments([
      "demo-site",
      "--name",
      "Demo Site",
      "--preset",
      "agency",
      "--no-tailwind",
      "--cms",
      "directus",
      "--blog",
      "--no-motion",
      "--docker",
      "--ai-kit",
      "--package-manager",
      "npm",
      "--skip-install",
      "--no-git",
    ]);

    expect(flags).toMatchObject({
      directory: "demo-site",
      name: "Demo Site",
      preset: "agency",
      tailwind: false,
      cms: "directus",
      blog: true,
      motion: false,
      docker: true,
      aiKit: true,
      packageManager: "npm",
      install: false,
      initializeGit: false,
    });
  });

  it("recognizes the version flag", () => {
    expect(parseCliArguments(["--version"]).version).toBe(true);
    expect(parseCliArguments(["-v"]).version).toBe(true);
  });

  it("rejects malformed and unsupported options", () => {
    expect(() => parseCliArguments(["--preset"])).toThrow(
      "--preset requires a value.",
    );
    expect(() => parseCliArguments(["--preset", "unknown"])).toThrow(
      "Invalid value for --preset: unknown.",
    );
    expect(() => parseCliArguments(["--no-preset"])).toThrow(
      "--no-preset is not supported.",
    );
    expect(() => parseCliArguments(["--unknown"])).toThrow(
      "Unknown option: --unknown",
    );
  });

  it("uses normalized defaults for unattended creation", () => {
    const options = defaultsFromFlags(
      parseCliArguments(["--name", "My Project", "--yes"]),
      "/projects",
    );
    expect(options.projectName).toBe("my-project");
    expect(options.destination).toBe("/projects/my-project");
    expect(options.features).toEqual({
      tailwind: true,
      cms: "markdown",
      blog: false,
      motion: false,
      docker: false,
      aiKit: false,
    });
  });

  it("normalizes valid package names", () => {
    expect(toPackageName(" My Project! ")).toBe("my-project");
  });

  it("prints a runnable development command for every package manager", () => {
    expect(developmentCommand("npm")).toBe("npm run dev");
    expect(developmentCommand("pnpm")).toBe("pnpm dev");
    expect(developmentCommand("yarn")).toBe("yarn dev");
    expect(developmentCommand("bun")).toBe("bun dev");
  });
});

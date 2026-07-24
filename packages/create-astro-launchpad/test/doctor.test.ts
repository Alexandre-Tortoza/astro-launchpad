import { describe, expect, it } from "vitest";
import {
  hasBuildScript,
  inferPackageManager,
  meetsNodeRequirement,
  missingDirectusEnvironment,
  parseDotEnv,
} from "../src/doctor.js";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("parseDotEnv", () => {
  it("parses simple key=value pairs", () => {
    expect(parseDotEnv("FOO=bar\nBAZ=qux")).toEqual({ FOO: "bar", BAZ: "qux" });
  });

  it("skips comments and blank lines", () => {
    expect(parseDotEnv("# comment\n\nFOO=bar")).toEqual({ FOO: "bar" });
  });

  it("strips surrounding quotes from values", () => {
    expect(parseDotEnv("A=\"hello\"\nB='world'")).toEqual({
      A: "hello",
      B: "world",
    });
  });

  it("preserves empty values", () => {
    expect(parseDotEnv("TOKEN=")).toEqual({ TOKEN: "" });
  });

  it("handles values that contain equals signs", () => {
    expect(parseDotEnv("URL=http://localhost:8055?foo=bar")).toEqual({
      URL: "http://localhost:8055?foo=bar",
    });
  });
});

describe("meetsNodeRequirement", () => {
  it("passes when version equals requirement", () => {
    expect(meetsNodeRequirement("v22.12.0", "22.12.0")).toBe(true);
  });

  it("passes when major is greater", () => {
    expect(meetsNodeRequirement("v23.0.0", "22.12.0")).toBe(true);
  });

  it("passes when minor is greater within same major", () => {
    expect(meetsNodeRequirement("v22.13.0", "22.12.0")).toBe(true);
  });

  it("passes when patch is greater within same major.minor", () => {
    expect(meetsNodeRequirement("v22.12.1", "22.12.0")).toBe(true);
  });

  it("fails when major is lower", () => {
    expect(meetsNodeRequirement("v20.0.0", "22.12.0")).toBe(false);
  });

  it("fails when minor is lower within same major", () => {
    expect(meetsNodeRequirement("v22.11.9", "22.12.0")).toBe(false);
  });

  it("fails when patch is lower within same major.minor", () => {
    expect(meetsNodeRequirement("v22.12.0", "22.12.1")).toBe(false);
  });
});

describe("Directus environment", () => {
  it("reports the token alongside other missing Directus values", () => {
    expect(
      missingDirectusEnvironment({ DIRECTUS_URL: "http://localhost:8055" }),
    ).toContain("DIRECTUS_TOKEN");
  });

  it("accepts a complete Directus environment", () => {
    expect(
      missingDirectusEnvironment({
        DIRECTUS_URL: "http://localhost:8055",
        DIRECTUS_TOKEN: "token",
        DIRECTUS_SECRET: "secret",
        DB_USER: "directus",
        DB_PASSWORD: "password",
        DB_DATABASE: "directus",
      }),
    ).toEqual([]);
  });
});

describe("hasBuildScript", () => {
  it("requires a string build script", () => {
    expect(hasBuildScript({ scripts: { build: "astro build" } })).toBe(true);
    expect(hasBuildScript({ scripts: {} })).toBe(false);
    expect(hasBuildScript(null)).toBe(false);
  });
});

describe("inferPackageManager", () => {
  async function withFiles(
    files: string[],
    fn: (dir: string) => Promise<void>,
  ) {
    const dir = await mkdtemp(join(tmpdir(), "launchpad-doctor-test-"));
    try {
      await Promise.all(files.map((f) => writeFile(join(dir, f), "")));
      await fn(dir);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }

  it("detects pnpm from pnpm-workspace.yaml", async () => {
    await withFiles(["pnpm-workspace.yaml"], async (dir) => {
      expect(await inferPackageManager(dir)).toBe("pnpm");
    });
  });

  it("detects pnpm from pnpm-lock.yaml", async () => {
    await withFiles(["pnpm-lock.yaml"], async (dir) => {
      expect(await inferPackageManager(dir)).toBe("pnpm");
    });
  });

  it("detects yarn from yarn.lock", async () => {
    await withFiles(["yarn.lock"], async (dir) => {
      expect(await inferPackageManager(dir)).toBe("yarn");
    });
  });

  it("detects bun from bun.lockb", async () => {
    await withFiles(["bun.lockb"], async (dir) => {
      expect(await inferPackageManager(dir)).toBe("bun");
    });
  });

  it("detects npm from package-lock.json", async () => {
    await withFiles(["package-lock.json"], async (dir) => {
      expect(await inferPackageManager(dir)).toBe("npm");
    });
  });

  it("falls back to pnpm when no lockfile exists", async () => {
    await withFiles([], async (dir) => {
      expect(await inferPackageManager(dir)).toBe("pnpm");
    });
  });
});

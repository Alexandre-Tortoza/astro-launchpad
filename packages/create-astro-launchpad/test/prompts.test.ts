import { describe, expect, it, vi } from "vitest";

vi.mock("@clack/prompts", () => ({
  cancel: vi.fn(),
  intro: vi.fn(),
  isCancel: () => true,
  text: vi.fn(),
}));

import { parseCliArguments } from "../src/options.js";
import { collectOptions } from "../src/prompts.js";

describe("interactive prompts", () => {
  it("stops project creation when the user cancels", async () => {
    await expect(
      collectOptions(parseCliArguments([]), "/projects"),
    ).rejects.toThrow("Project creation cancelled.");
  });
});

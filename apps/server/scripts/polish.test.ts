import { describe, expect, it, vi } from "vitest";
import { polishDescription } from "./polish";

describe("polishDescription", () => {
  it("sends the description to the generator and trims its result", async () => {
    let capturedPrompt = "";
    const generate = vi.fn(async (prompt: string) => {
      capturedPrompt = prompt;
      return "  A welcoming homestay.  ";
    });

    const result = await polishDescription("  Near the city center.  ", generate);

    expect(result).toBe("A welcoming homestay.");
    expect(generate).toHaveBeenCalledOnce();
    expect(capturedPrompt).toContain("Near the city center.");
    expect(capturedPrompt).toContain("do not invent");
  });

  it("rejects an empty input without calling the generator", async () => {
    const generate = vi.fn(async (_prompt: string) => "unused");

    await expect(polishDescription("  ", generate)).rejects.toThrow(
      "Description must not be empty",
    );
    expect(generate).not.toHaveBeenCalled();
  });

  it("rejects an empty generated result", async () => {
    await expect(polishDescription("A small homestay", async (_prompt: string) => "  ")).rejects.toThrow(
      "Polisher returned an empty description",
    );
  });
});

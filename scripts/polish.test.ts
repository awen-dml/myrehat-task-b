import { describe, expect, it, vi } from "vitest";
import { polishDescription } from "./polish";

describe("polishDescription", () => {
  it("sends the description to the generator and trims its result", async () => {
    const generate = vi.fn(async () => "  A welcoming homestay.  ");

    const result = await polishDescription("  Near the city center.  ", generate);

    expect(result).toBe("A welcoming homestay.");
    expect(generate).toHaveBeenCalledOnce();
    expect(generate.mock.calls[0][0]).toContain("Near the city center.");
    expect(generate.mock.calls[0][0]).toContain("do not invent");
  });

  it("rejects an empty input without calling the generator", async () => {
    const generate = vi.fn(async () => "unused");

    await expect(polishDescription("  ", generate)).rejects.toThrow(
      "Description must not be empty",
    );
    expect(generate).not.toHaveBeenCalled();
  });

  it("rejects an empty generated result", async () => {
    await expect(polishDescription("A small homestay", async () => "  ")).rejects.toThrow(
      "Polisher returned an empty description",
    );
  });
});

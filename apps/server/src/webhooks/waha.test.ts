import { describe, expect, it, vi } from "vitest";
import { processWahaPayload } from "./waha";

describe("processWahaPayload", () => {
  it("returns to and reply for a valid message", async () => {
    const generateReply = vi.fn(async (_message: string) => " Hello there! ");

    const result = await processWahaPayload(
      { event: "message", payload: { from: "628123456789", body: "Hello" } },
      generateReply,
    );

    expect(result).toEqual({
      status:  200,
      body: { to: "628123456789", reply: "Hello there!" },
    });
    expect(generateReply).toHaveBeenCalledWith("Hello");
  });

  it("rejects invalid event or empty message", async () => {
    const generateReply = vi.fn(async (_message: string) => "Reply");

    const invalidEvent = await processWahaPayload(
      { event: "session.status", payload: { from: "12345678", body: "Hi" } },
      generateReply,
    );
    const emptyBody = await processWahaPayload(
      { event: "message", payload: { from: "12345678", body: " " } },
      generateReply,
    );

    expect(invalidEvent.status).toBe(400);
    expect(emptyBody.status).toBe(400);
    expect(generateReply).not.toHaveBeenCalled();
  });
});

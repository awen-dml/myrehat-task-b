import { z } from "zod";

export const wahaPayloadSchema = z.object({
  event: z.literal("message"),
  payload: z.object({
    from: z.string().trim().min(1).max(200),
    body: z.string().trim().min(1).max(4000),
  }),
});

export type WahaPayload = z.infer<typeof wahaPayloadSchema>;

export type ReplyGenerator = (message: string) => Promise<string>;

export async function processWahaPayload(
  input: unknown,
  generateReply: ReplyGenerator,
) {
  const parsed = wahaPayloadSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: 400,
      body: {
        error: "Invalid WAHA message payload",
        details: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    } as const;
  }

  const to = parsed.data.payload.from;
  const message = parsed.data.payload.body;
  const reply = await generateReply(message);

  if (!reply.trim()) {
    throw new Error("Reply generator returned an empty response");
  }

  return {
    status: 200,
    body: {
      to,
      reply: reply.trim(),
    },
  } as const;
}

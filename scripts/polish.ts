export type DescriptionGenerator = (prompt: string) => Promise<string>;

export async function polishDescription(
  description: string,
  generate: DescriptionGenerator,
): Promise<string> {
  const input = description.trim();

  if (!input) throw new Error("Description must not be empty");

  const result = await generate(
    `Polish this homestay listing description. Keep all factual details accurate, do not invent amenities or claims, and return only the improved description:\n\n${input}`,
  );

  if (!result.trim()) throw new Error("Polisher returned an empty description");

  return result.trim();
}

async function main() {
  const description = process.argv.slice(2).join(" ").trim();

  if (!description) {
    console.error('Usage: bun run scripts/polish.ts "Original listing description"');
    process.exitCode = 1;
    return;
  }

  const { generateText } = await import("ai");
  const { createOpencode } = await import("ai-sdk-provider-opencode-sdk");

  const result = await polishDescription(description, async (prompt) => {
    const response = await generateText({
      model: createOpencode()("opencode/big-pickle"),
      prompt,
    });
    return response.text;
  });

  console.log(result);
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("Failed to polish description:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

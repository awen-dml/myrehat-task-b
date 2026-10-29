import { describe, expect, it } from "vitest";
import { z } from "zod";
import { BUY_HOMESTAY_CATEGORIES } from "@myrehat-task-b/db/schema/buy-homestay";

const listingInputSchema = z.object({
  title: z.string().trim().min(3).max(120),
  price: z.number().positive().finite(),
  location: z.string().trim().min(2).max(160),
  category: z.enum(BUY_HOMESTAY_CATEGORIES),
  whatsapp: z.string().trim().min(8).max(24),
  description: z.string().trim().max(3000).default(""),
});

describe("BuyHomestay Category Validation", () => {
  it("accepts all exactly 4 valid categories", () => {
    for (const category of BUY_HOMESTAY_CATEGORIES) {
      const result = listingInputSchema.safeParse({
        title: "Test Homestay",
        price: 100000,
        location: "Bali",
        category,
        whatsapp: "+62812345678",
        description: "Test description",
      });
      expect(result.success).toBe(true);
    }
    expect(BUY_HOMESTAY_CATEGORIES).toHaveLength(4);
  });

  it("rejects an invalid category", () => {
    const result = listingInputSchema.safeParse({
      title: "Test Homestay",
      price: 100000,
      location: "Bali",
      category: "Buy Hotel",
      whatsapp: "+62812345678",
      description: "Test description",
    });
    expect(result.success).toBe(false);
  });
});

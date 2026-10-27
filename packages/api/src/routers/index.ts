import { randomUUID } from "node:crypto";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { buyHomestay, BUY_HOMESTAY_CATEGORIES } from "@myrehat-task-b/db/schema/buy-homestay";
import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";

const listingInput = z.object({
  title: z.string().trim().min(3).max(120),
  price: z.number().positive().finite(),
  location: z.string().trim().min(2).max(160),
  category: z.enum(BUY_HOMESTAY_CATEGORIES),
  whatsapp: z.string().trim().min(8).max(24).regex(/^[+0-9()\-\s]+$/),
  description: z.string().trim().max(3000).default(""),
});

export const appRouter = {
  healthCheck: publicProcedure.handler(() => "OK"),

  privateData: protectedProcedure.handler(({ context }) => ({
    message: "This is private",
    user: context.session?.user,
  })),

  buyHomestay: {
    list: publicProcedure.handler(async ({ context }) => {
      return context.db
        .select()
        .from(buyHomestay)
        .orderBy(desc(buyHomestay.createdAt));
    }),

    create: protectedProcedure
      .input(listingInput)
      .handler(async ({ context, input }) => {
        const userId = context.session?.user?.id;

        if (!userId) {
          throw new Error("Authenticated user ID is missing");
        }

        const [created] = await context.db
          .insert(buyHomestay)
          .values({
            id: randomUUID(),
            userId,
            title: input.title,
            price: input.price.toFixed(2),
            location: input.location,
            category: input.category,
            whatsapp: input.whatsapp,
            description: input.description,
          })
          .returning();

        return created;
      }),
  },
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;


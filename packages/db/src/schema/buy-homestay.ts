import { pgTable, text, timestamp, numeric, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const BUY_HOMESTAY_CATEGORIES = [
  "Buy Property",
  "Buy land to build homestay",
  "Buy Airbnb Profile",
  "Buy Airbnb Business",
] as const;

export type BuyHomestayCategory = (typeof BUY_HOMESTAY_CATEGORIES)[number];

export const buyHomestay = pgTable(
  "buy_homestay",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    price: numeric("price", { precision: 14, scale: 2 }).notNull(),
    location: text("location").notNull(),
    category: text("category").notNull(),
    whatsapp: text("whatsapp").notNull(),
    description: text("description").notNull().default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("buy_homestay_user_id_idx").on(table.userId),
    index("buy_homestay_created_at_idx").on(table.createdAt),
  ],
);

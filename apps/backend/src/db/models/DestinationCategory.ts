import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { categories } from "./Category";
import { destinations } from "./Destination";

export const destinationCategories = pgTable(
  "destination_categories",
  {
    destinationId: uuid("destination_id")
      .notNull()
      .references(() => destinations.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.destinationId, table.categoryId],
    }),
  }),
);

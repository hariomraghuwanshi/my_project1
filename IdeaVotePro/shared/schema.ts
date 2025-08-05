import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const ideas = pgTable("ideas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  aiRating: integer("ai_rating").notNull(),
  votes: integer("votes").notNull().default(0),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertIdeaSchema = createInsertSchema(ideas, {
  name: z.string().min(1, "Startup name is required").max(100, "Name too long"),
  tagline: z.string().min(1, "Tagline is required").max(150, "Tagline too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description too long"),
}).omit({
  id: true,
  aiRating: true,
  votes: true,
  views: true,
  createdAt: true,
});

export type InsertIdea = z.infer<typeof insertIdeaSchema>;
export type Idea = typeof ideas.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

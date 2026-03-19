import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const githubUsers = pgTable("github_users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  githubId: integer("github_id").notNull().unique(),
  login: varchar("login", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  location: varchar("location", { length: 255 }),
  website: text("website"),
  repos: integer("repos").notNull().default(0),
  followers: integer("followers").notNull().default(0),
  following: integer("following").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

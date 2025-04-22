import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Discord Bot Schemas
export const servers = pgTable("servers", {
  id: text("id").primaryKey(), // Discord server ID
  name: text("name").notNull(),
});

export const insertServerSchema = createInsertSchema(servers);
export type InsertServer = z.infer<typeof insertServerSchema>;
export type Server = typeof servers.$inferSelect;

// Logging configuration
export const loggingConfigs = pgTable("logging_configs", {
  id: serial("id").primaryKey(),
  serverId: text("server_id").notNull().references(() => servers.id),
  enabled: boolean("enabled").notNull().default(false),
  logChannelId: text("log_channel_id"),
  logMessageDeletions: boolean("log_message_deletions").notNull().default(false),
  logMessageEdits: boolean("log_message_edits").notNull().default(false),
  logRolesAdded: boolean("log_roles_added").notNull().default(false),
  logUserBans: boolean("log_user_bans").notNull().default(false),
  logUserLeaves: boolean("log_user_leaves").notNull().default(false),
});

export const insertLoggingConfigSchema = createInsertSchema(loggingConfigs).omit({
  id: true
});

export type InsertLoggingConfig = z.infer<typeof insertLoggingConfigSchema>;
export type LoggingConfig = typeof loggingConfigs.$inferSelect;

// Welcome configuration
export const welcomeConfigs = pgTable("welcome_configs", {
  id: serial("id").primaryKey(),
  serverId: text("server_id").notNull().references(() => servers.id),
  enabled: boolean("enabled").notNull().default(false),
  welcomeChannelId: text("welcome_channel_id"),
  welcomeMessage: text("welcome_message").notNull().default("Welcome to @server, @username!"),
  includeImage: boolean("include_image").notNull().default(true),
  backgroundImage: text("background_image").notNull().default("default"),
  textColor: text("text_color").notNull().default("#FFFFFF"),
});

export const insertWelcomeConfigSchema = createInsertSchema(welcomeConfigs).omit({
  id: true
});

export type InsertWelcomeConfig = z.infer<typeof insertWelcomeConfigSchema>;
export type WelcomeConfig = typeof welcomeConfigs.$inferSelect;

// Discord channels
export const channels = pgTable("channels", {
  id: text("id").primaryKey(), // Discord channel ID
  serverId: text("server_id").notNull().references(() => servers.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // text, voice, etc.
});

export const insertChannelSchema = createInsertSchema(channels);
export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type Channel = typeof channels.$inferSelect;

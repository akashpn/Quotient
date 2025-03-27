import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: integer("owner_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").default(""),
  language: text("language").notNull(),
  projectId: integer("project_id").notNull(),
  path: text("path").notNull(),
  lastModified: timestamp("last_modified").defaultNow().notNull(),
});

export const collaborators = pgTable("collaborators", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  projectId: integer("project_id").notNull(),
  role: text("role").default("editor").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  ownerId: true,
});

export const insertFileSchema = createInsertSchema(files).pick({
  name: true,
  content: true,
  language: true,
  projectId: true,
  path: true,
});

export const insertCollaboratorSchema = createInsertSchema(collaborators).pick({
  userId: true,
  projectId: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;

export type InsertCollaborator = z.infer<typeof insertCollaboratorSchema>;
export type Collaborator = typeof collaborators.$inferSelect;

// Websocket message types
export const messageSchema = z.object({
  type: z.enum([
    'cursor',
    'selection',
    'edit',
    'join',
    'leave',
    'sync',
    'file_change',
    'save',
    'saved',
    'users_list',
    'create_file',
    'create_folder',
    'delete_file',
    'rename_file'
  ]),
  userId: z.number(),
  username: z.string(),
  fileId: z.number().optional(),
  data: z.any(),
  timestamp: z.number().optional(),
});

export type Message = z.infer<typeof messageSchema>;

// Supported programming languages
export const supportedLanguages = [
  'javascript',
  'typescript',
  'python',
  'java',
  'c',
  'cpp',
  'csharp',
  'go',
  'rust',
  'ruby',
  'php',
  'html',
  'css',
  'json',
  'markdown'
] as const;

export type SupportedLanguage = typeof supportedLanguages[number];

export const languageIconMap: Record<SupportedLanguage, string> = {
  javascript: 'js',
  typescript: 'ts',
  python: 'python',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  csharp: 'csharp',
  go: 'go',
  rust: 'rust',
  ruby: 'ruby',
  php: 'php',
  html: 'html5',
  css: 'css3',
  json: 'node-js',
  markdown: 'markdown'
};

export const languageExtMap: Record<SupportedLanguage, string> = {
  javascript: 'js',
  typescript: 'ts',
  python: 'py',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  csharp: 'cs',
  go: 'go',
  rust: 'rs',
  ruby: 'rb',
  php: 'php',
  html: 'html',
  css: 'css',
  json: 'json',
  markdown: 'md'
};

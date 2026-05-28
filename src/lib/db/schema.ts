// To enable pgvector: CREATE EXTENSION IF NOT EXISTS vector;
// Then add: import { customType } from 'drizzle-orm/pg-core' to define vector columns for embeddings.

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { relations, sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Better-Auth required tables ───────────────────────────────────────────────

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
});

export const pantryItems = pgTable(
  'pantry_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    category: text('category').notNull(),
    quantity: integer('quantity').notNull().default(1),
    unit: text('unit').notNull(),
    expirationDate: timestamp('expiration_date', { withTimezone: true }),
    expiryAlertDays: integer('expiry_alert_days').default(3),
    addedAt: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('pantry_items_user_id_idx').on(table.userId),
    userIdExpirationIdx: index('pantry_items_user_id_expiration_idx').on(
      table.userId,
      table.expirationDate,
    ),
    userIdNameUnique: uniqueIndex('pantry_items_user_id_name_unique').on(table.userId, table.name),
  }),
);

export const cookingSessions = pgTable('cooking_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  recipeName: text('recipe_name').notNull(),
  recipeData: jsonb('recipe_data').notNull(),
  rating: integer('rating'),
  completed: boolean('completed').notNull().default(false),
  cookedAt: timestamp('cooked_at', { withTimezone: true }).defaultNow().notNull(),
});

export const savedRecipes = pgTable('saved_recipes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  ingredients: jsonb('ingredients').notNull(),
  steps: jsonb('steps').notNull(),
  nutrition: jsonb('nutrition'),
  savedAt: timestamp('saved_at', { withTimezone: true }).defaultNow().notNull(),
});

export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  dietaryRestrictions: text('dietary_restrictions').array().notNull().default(sql`ARRAY[]::text[]`),
  dislikedIngredients: text('disliked_ingredients').array().notNull().default(sql`ARRAY[]::text[]`),
  cuisinePreferences: text('cuisine_preferences').array().notNull().default(sql`ARRAY[]::text[]`),
  skillLevel: integer('skill_level').notNull().default(1),
});

// ── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many, one }) => ({
  pantryItems: many(pantryItems),
  cookingSessions: many(cookingSessions),
  savedRecipes: many(savedRecipes),
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
}));

export const pantryItemsRelations = relations(pantryItems, ({ one }) => ({
  user: one(users, {
    fields: [pantryItems.userId],
    references: [users.id],
  }),
}));

export const cookingSessionsRelations = relations(cookingSessions, ({ one }) => ({
  user: one(users, {
    fields: [cookingSessions.userId],
    references: [users.id],
  }),
}));

export const savedRecipesRelations = relations(savedRecipes, ({ one }) => ({
  user: one(users, {
    fields: [savedRecipes.userId],
    references: [users.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

// ── Inferred Types ────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type PantryItem = typeof pantryItems.$inferSelect;
export type NewPantryItem = typeof pantryItems.$inferInsert;
export type CookingSession = typeof cookingSessions.$inferSelect;
export type NewCookingSession = typeof cookingSessions.$inferInsert;
export type SavedRecipe = typeof savedRecipes.$inferSelect;
export type NewSavedRecipe = typeof savedRecipes.$inferInsert;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Verification = typeof verifications.$inferSelect;

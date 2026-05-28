import { createTRPCRouter, publicProcedure } from './server';
import { pantryRouter } from '@/features/pantry/pantry.router';
import { recipesRouter } from '@/features/recipes/router';
import { authRouter } from '@/features/auth/auth.router';

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => ({
    status: 'ok' as const,
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  })),

  auth: authRouter,
  pantry: pantryRouter,
  recipes: recipesRouter,
});

export type AppRouter = typeof appRouter;

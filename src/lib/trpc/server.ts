import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { captureException } from '@/lib/monitoring';

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({ headers: opts.headers });
  return {
    db,
    session,
  };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

function getFriendlyMessage(error: TRPCError): string | undefined {
  switch (error.code) {
    case 'UNAUTHORIZED':
      return 'Please sign in to continue';
    case 'FORBIDDEN':
      return "You don't have permission to do that";
    case 'NOT_FOUND':
      return 'The requested item was not found';
    case 'TOO_MANY_REQUESTS':
      return 'Daily limit reached (10/day). Try again tomorrow.';
    case 'INTERNAL_SERVER_ERROR': {
      const causeMsg =
        error.cause instanceof Error ? error.cause.message.toLowerCase() : '';
      if (causeMsg.includes('unique') || causeMsg.includes('23505')) {
        return 'This item already exists';
      }
      if (
        causeMsg.includes('connect') ||
        causeMsg.includes('econnrefused') ||
        causeMsg.includes('network')
      ) {
        return 'Service temporarily unavailable. Please try again.';
      }
      return 'Something went wrong. Please try again.';
    }
    default:
      return undefined;
  }
}

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      captureException(error.cause ?? error, {
        trpcCode: error.code,
        path: shape.data?.path,
      });
    }

    const friendlyMessage = getFriendlyMessage(error);

    return {
      ...shape,
      message: friendlyMessage ?? shape.message,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
        friendlyMessage: friendlyMessage ?? null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action";
import { getTypedSession } from "../auth-helpers";
import { requirePermission } from "../permissions";
import type { AppPermission } from "@/app/generated/prisma";

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    console.error("Action error:", e.message);
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

export const authenticatedAction = actionClient.use(async ({ next }) => {
  const session = await getTypedSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return next({
    ctx: {
      userId: session.user.id,
      user: session.user,
      session,
    },
  });
});

export const unauthenticatedAction = actionClient;

// Permission-aware action creators
export const submissionAction = authenticatedAction.use(async ({ next, ctx }) => {
  requirePermission(ctx.session, 'SUBMISSION' as AppPermission);
  return next({ ctx });
});

export const reviewingAction = authenticatedAction.use(async ({ next, ctx }) => {
  requirePermission(ctx.session, 'REVIEWING' as AppPermission);
  return next({ ctx });
});

export const adminAction = authenticatedAction.use(async ({ next, ctx }) => {
  requirePermission(ctx.session, 'ADMIN' as AppPermission);
  return next({ ctx });
});
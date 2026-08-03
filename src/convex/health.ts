import { query } from "./_generated/server";
import { v } from "convex/values";

/** Health check used while bootstrapping the Convex deployment. */
export const ping = query({
  args: {},
  returns: v.literal("ok"),
  handler: async () => "ok" as const,
});

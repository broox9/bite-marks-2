import { query } from "./_generated/server";

/** Health check used while bootstrapping the Convex deployment. */
export const ping = query({
  args: {},
  handler: async () => "ok",
});

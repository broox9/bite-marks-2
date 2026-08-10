import { command, getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
import { z } from "zod";
import { createConvexHttpClient } from "@mmailaender/convex-better-auth-svelte/sveltekit";
import { api } from "$convex/_generated/api";

const listSchema = z.object({});
const createSchema = z.object({
  tagName: z.string().min(1),
});

export const listTags = query(listSchema, async () => {
  const event = getRequestEvent();
  const user = event.locals.user;
  if (!user) throw error(401, "Unauthorized");

  const client = createConvexHttpClient();
  const tags = await client.query(api.tags.listForUser, { userId: user.id });
  return tags.map((tag) => ({
    id: tag._id,
    tagName: tag.tagName,
    userId: tag.userId,
    createdAt: new Date(tag._creationTime).toISOString(),
    updatedAt: new Date(tag._creationTime).toISOString(),
  }));
});

export const createTag = command(createSchema, async ({ tagName }) => {
  const event = getRequestEvent();
  const user = event.locals.user;
  if (!user) throw error(401, "Unauthorized");

  const client = createConvexHttpClient();
  const tag = await client.mutation(api.tags.create, {
    userId: user.id,
    tagName: tagName.trim(),
  });
  if (!tag) throw error(500, "Failed to create tag");
  return {
    id: tag._id,
    tagName: tag.tagName,
    userId: tag.userId,
    createdAt: new Date(tag._creationTime).toISOString(),
    updatedAt: new Date(tag._creationTime).toISOString(),
  };
});

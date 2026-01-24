import { z } from "zod";

export const TagResultSchema = z.object({
  id: z.string(),
  tagName: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TagInputSchema = TagResultSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type TagResult = z.infer<typeof TagResultSchema>;
export type TagInput = z.infer<typeof TagInputSchema>;


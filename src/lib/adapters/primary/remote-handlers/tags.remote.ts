import { command, query } from '$app/server';
import { z } from 'zod';
import { backendForWebsite } from '$lib/glue/backend.server';
import { tagInputSchema } from '$lib/core/domain/api';
import { operations } from '$lib/use_cases/backend';
import type { Page, Tag } from '$lib/ports/backend.repository';

export const listTags = query(z.object({}), async () => {
  const result = await operations.list_tags.execute(backendForWebsite(), { limit: 100 }) as Page<Tag>;
  return result.items;
});
export const createTag = command(tagInputSchema, input => operations.create_tag.execute(backendForWebsite(), input) as Promise<Tag>);

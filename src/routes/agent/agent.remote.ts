import { command } from '$app/server';
import { aiInputSchema } from '$lib/core/domain/api';
import { backendForWebsite } from '$lib/glue/backend.server';
import { operations } from '$lib/use_cases/backend';

export const agentRemoteCall = command(aiInputSchema.shape.prompt, async prompt => {
  const result = await operations.create_ai_response.execute(backendForWebsite(), { prompt }) as { text: string };
  return result.text;
});

import type { RequestHandler } from './$types';
import { backendForHttp } from '$lib/glue/backend.server';
import { operations } from '$lib/use_cases/backend';
import { readJson } from '$lib/adapters/primary/http/rest';
import { errorResponse } from '$lib/adapters/primary/http/errors';

export const POST: RequestHandler = async event => {
  try {
    const context = await backendForHttp(event);
    const result = await operations.create_ai_response.execute(context, await readJson(event.request)) as { text: string };
    return new Response(result.text, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
  } catch (error) { return errorResponse(error); }
};

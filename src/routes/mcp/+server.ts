import type { RequestHandler } from './$types';
import { backendForHttp, canonicalSiteUrl } from '$lib/glue/backend.server';
import { handleMcp } from '$lib/adapters/primary/http/mcp';
import { errorResponse } from '$lib/adapters/primary/http/errors';
import { readJson } from '$lib/adapters/primary/http/rest';
import { ApplicationError } from '$lib/core/domain/api';

export const POST: RequestHandler = async event => {
  const site = canonicalSiteUrl();
  const metadata = `${site}/.well-known/oauth-protected-resource/mcp`;
  try {
    const origin = event.request.headers.get('origin');
    if (origin && origin !== site) throw new ApplicationError(403, 'forbidden', 'Origin is not allowed');
    const context = await backendForHttp(event, 'mcp');
    const body = await readJson(event.request);
    const request = new Request(event.request.url, { method: 'POST', headers: event.request.headers, body: JSON.stringify(body) });
    const response = await handleMcp(request, context, metadata);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) { return errorResponse(error, metadata); }
};
// Streamable HTTP with JSON responses: no SSE stream and no persistent sessions.
export const GET = () => new Response(null, { status: 405, headers: { Allow: 'POST' } });
export const DELETE = GET;

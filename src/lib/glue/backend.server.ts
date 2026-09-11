import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { ConvexHttpClient } from 'convex/browser';
import { getRequestEvent } from '$app/server';
import type { RequestEvent } from '@sveltejs/kit';
import { ConvexBackend } from '$lib/adapters/secondary/convex/backend';
import { GooglePlaceSearch } from '$lib/adapters/secondary/google/server-search';
import { OpenAITextGeneration } from '$lib/adapters/secondary/ai/responses';
import { authenticateRequest } from '$lib/adapters/primary/http/auth';
import { ApplicationError, READ_SCOPE, WRITE_SCOPE, type Principal } from '$lib/core/domain/api';
import type { BackendContext } from '$lib/use_cases/backend';

export function canonicalSiteUrl() {
  const site = publicEnv.PUBLIC_SITE_URL;
  if (!site) throw new ApplicationError(503, 'not_configured', 'Site URL is not configured');
  return site.replace(/\/$/, '');
}
function compose(token: string, principal: Principal): BackendContext {
  if (!publicEnv.PUBLIC_CONVEX_URL || !['1', 'true'].includes(env.USE_CONVEX ?? '')) {
    throw new ApplicationError(503, 'not_configured', 'The shared API requires Convex');
  }
  const client = new ConvexHttpClient(publicEnv.PUBLIC_CONVEX_URL);
  client.setAuth(token);
  return { principal, repository: new ConvexBackend(client, principal.userId),
    places: new GooglePlaceSearch(env.GOOGLE_PLACES_API_KEY), ai: new OpenAITextGeneration(env.OPENAI_API_KEY) };
}
export async function backendForHttp(event: RequestEvent, resource: 'mcp' | 'api/v1' = 'api/v1') {
  const auth = await authenticateRequest(event, canonicalSiteUrl(), resource);
  const context = compose(auth.token, auth.principal);
  // Convex verifies live consent for connector tokens, including operations without database reads.
  await context.repository.getPreferences();
  return context;
}
export function backendForWebsite() {
  const { locals } = getRequestEvent();
  if (!locals.user || !locals.token) throw new ApplicationError(401, 'unauthorized', 'Sign in required');
  return compose(locals.token, { userId: locals.user.id, scopes: [READ_SCOPE, WRITE_SCOPE] });
}

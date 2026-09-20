import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/public';
import { canonicalSiteUrl } from '$lib/glue/backend.server';

export const GET: RequestHandler = async ({ params, fetch }) => {
  const site = canonicalSiteUrl();
  const resources: Record<string, string> = {
    'oauth-protected-resource/mcp': 'mcp',
    'oauth-protected-resource': 'mcp',
    'oauth-protected-resource/api/v1': 'api/v1',
  };
  const resource = resources[params.path];
  if (resource) return Response.json({
    resource: `${site}/${resource}`, authorization_servers: [`${site}/api/auth`],
    scopes_supported: ['bite:read', 'bite:write'], bearer_methods_supported: ['header'],
  });
  if (['oauth-authorization-server/api/auth', 'openid-configuration/api/auth'].includes(params.path)) {
    if (!env.PUBLIC_CONVEX_SITE_URL) return Response.json({ error: 'OAuth discovery is not configured' }, { status: 503 });
    const kind = params.path.split('/')[0];
    const response = await fetch(`${env.PUBLIC_CONVEX_SITE_URL}/api/auth/.well-known/${kind}`, { redirect: 'manual' });
    if (response.status >= 300 && response.status < 400) {
      return Response.json({ error: 'Unexpected OAuth discovery redirect' }, { status: 502 });
    }
    return new Response(response.body, { status: response.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  }
  return new Response('Not found', { status: 404 });
};

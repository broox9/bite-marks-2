import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { RequestEvent } from '@sveltejs/kit';
import { ApplicationError, READ_SCOPE, WRITE_SCOPE, type Principal } from '$lib/core/domain/api';

let cachedJwks: ReturnType<typeof createRemoteJWKSet> | undefined;
let cachedJwksUrl = '';

function jwksFor(origin: string) {
  const url = `${origin}/api/auth/convex/jwks`;
  if (!cachedJwks || cachedJwksUrl !== url) {
    cachedJwksUrl = url;
    cachedJwks = createRemoteJWKSet(new URL(url));
  }
  return cachedJwks;
}

export async function authenticateRequest(event: Pick<RequestEvent, 'request' | 'locals' | 'url'>, siteUrl: string, resource: 'mcp' | 'api/v1') {
  const origin = siteUrl.replace(/\/$/, '');
  const authorization = event.request.headers.get('authorization');
  if (authorization !== null) {
    const match = /^Bearer ([^\s]+)$/i.exec(authorization);
    if (!match) throw new ApplicationError(401, 'unauthorized', 'Invalid bearer authorization');
    try {
      const { payload } = await jwtVerify(match[1], jwksFor(origin), {
        issuer: `${origin}/api/auth`, audience: `${origin}/${resource}`, algorithms: ['RS256'],
        requiredClaims: ['sub', 'exp', 'iat'],
      });
      if (!payload.sub || payload.biteConnector !== true || typeof payload.scope !== 'string') throw new Error('Invalid claims');
      return { token: match[1], principal: { userId: payload.sub, scopes: payload.scope.split(' ') } satisfies Principal };
    } catch {
      throw new ApplicationError(401, 'unauthorized', 'Invalid or expired access token');
    }
  }
  // MCP must always use its resource-bound OAuth token; browser sessions are for REST/remote functions.
  if (resource === 'mcp' || !event.locals.user || !event.locals.token) {
    throw new ApplicationError(401, 'unauthorized', 'Sign in required');
  }
  if (!['GET', 'HEAD', 'OPTIONS'].includes(event.request.method)) {
    if (event.request.headers.get('origin') !== event.url.origin) {
      throw new ApplicationError(403, 'forbidden', 'A same-origin request is required for cookie authentication');
    }
  }
  return { token: event.locals.token, principal: { userId: event.locals.user.id, scopes: [READ_SCOPE, WRITE_SCOPE] } satisfies Principal };
}

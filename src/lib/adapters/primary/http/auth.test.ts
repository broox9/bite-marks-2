import { afterEach, describe, expect, it, vi } from 'vitest';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { authenticateRequest } from './auth';

afterEach(() => vi.unstubAllGlobals());

function event(method = 'GET', origin?: string) {
  const url = new URL('https://bite.example/api/v1/spots');
  return {
    request: new Request(url, { method, headers: origin ? { Origin: origin } : undefined }),
    url,
    locals: { user: { id: 'user-1' }, token: 'website-token' },
  } as any;
}

describe('HTTP authentication', () => {
  it('accepts the existing website session for REST reads', async () => {
    await expect(authenticateRequest(event(), 'https://bite.example', 'api/v1')).resolves.toMatchObject({
      token: 'website-token',
      principal: { userId: 'user-1', scopes: ['bite:read', 'bite:write'] },
    });
  });

  it('requires same-origin website requests for REST writes', async () => {
    await expect(authenticateRequest(event('POST', 'https://evil.example'), 'https://bite.example', 'api/v1'))
      .rejects.toMatchObject({ status: 403, code: 'forbidden' });
    await expect(authenticateRequest(event('POST', 'https://bite.example'), 'https://bite.example', 'api/v1'))
      .resolves.toMatchObject({ token: 'website-token' });
  });

  it('never treats a website cookie as MCP authorization', async () => {
    await expect(authenticateRequest(event(), 'https://bite.example', 'mcp'))
      .rejects.toMatchObject({ status: 401, code: 'unauthorized' });
  });

  it('does not fall back to a website cookie when a bearer header is malformed', async () => {
    const value = event();
    value.request = new Request(value.url, { headers: { Authorization: 'Basic abc' } });
    await expect(authenticateRequest(value, 'https://bite.example', 'api/v1'))
      .rejects.toMatchObject({ status: 401, code: 'unauthorized' });
  });

  it('accepts a resource-bound connector JWT from the shared RSA key set', async () => {
    const { publicKey, privateKey } = await generateKeyPair('RS256');
    const publicJwk = await exportJWK(publicKey);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ keys: [{ ...publicJwk, kid: 'test-key', alg: 'RS256' }] })));
    const token = await new SignJWT({ biteConnector: true, scope: 'bite:read', azp: 'agent-client' })
      .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
      .setSubject('user-1')
      .setIssuer('https://bite.example/api/auth')
      .setAudience('https://bite.example/mcp')
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(privateKey);
    const value = event();
    value.request = new Request(value.url, { headers: { Authorization: `Bearer ${token}` } });

    await expect(authenticateRequest(value, 'https://bite.example', 'mcp')).resolves.toMatchObject({
      token,
      principal: { userId: 'user-1', scopes: ['bite:read'] },
    });
  });
});

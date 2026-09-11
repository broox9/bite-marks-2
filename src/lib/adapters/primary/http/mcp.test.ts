import { describe, expect, it, vi } from 'vitest';
import { handleMcp } from './mcp';
import { READ_SCOPE, WRITE_SCOPE } from '$lib/core/domain/api';
import type { BackendContext } from '$lib/use_cases/backend';

function context(scopes: string[] = [READ_SCOPE, WRITE_SCOPE]) {
  return {
    principal: { userId: 'user-1', scopes },
    repository: {
      listSpots: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
      getSpot: vi.fn(), saveSpot: vi.fn(), updateSpot: vi.fn(), deleteSpot: vi.fn(),
      listTags: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
      getTag: vi.fn(), createTag: vi.fn(), updateTag: vi.fn(), deleteTag: vi.fn(),
      listPlaces: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
      getPlace: vi.fn(), getPreferences: vi.fn().mockResolvedValue({ defaultLocation: null }),
      updatePreferences: vi.fn(),
    },
    places: { search: vi.fn() }, ai: { respond: vi.fn() },
  } as unknown as BackendContext;
}

function request(body: unknown) {
  return new Request('https://bite.example/mcp', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify(body),
  });
}

describe('MCP adapter', () => {
  it('answers the MCP initialize handshake without opening an SSE stream', async () => {
    const response = await handleMcp(request({
      jsonrpc: '2.0', id: 1, method: 'initialize',
      params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '1.0.0' } },
    }), context(), 'https://bite.example/.well-known/oauth-protected-resource/mcp');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    await expect(response.json()).resolves.toMatchObject({ result: { serverInfo: { name: 'bite-marks' } } });
  });

  it('exposes the shared capabilities as MCP tools', async () => {
    const response = await handleMcp(request({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }), context(),
      'https://bite.example/.well-known/oauth-protected-resource/mcp');
    expect(response.status).toBe(200);
    const body = await response.json() as { result: { tools: { name: string }[] } };
    expect(body.result.tools.map(tool => tool.name)).toEqual(expect.arrayContaining([
      'list_spots', 'save_spot', 'list_tags', 'search_places', 'get_preferences', 'create_ai_response',
    ]));
  });

  it('returns tool-level insufficient-scope errors for read-only connections', async () => {
    const response = await handleMcp(request({
      jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'create_tag', arguments: { tagName: 'favorites' } },
    }), context([READ_SCOPE]), 'https://bite.example/.well-known/oauth-protected-resource/mcp');
    const body = await response.json() as { result: { isError: boolean; _meta: Record<string, string[]> } };
    expect(body.result.isError).toBe(true);
    expect(body.result._meta['mcp/www_authenticate'][0]).toContain('scope="bite:read bite:write"');
  });
});

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { operations, type BackendContext } from '$lib/use_cases/backend';
import { publicError } from './errors';
import { READ_SCOPE, WRITE_SCOPE } from '$lib/core/domain/api';

export async function handleMcp(request: Request, context: BackendContext, metadataUrl: string) {
  const server = new McpServer({ name: 'bite-marks', version: '1.0.0' });
  for (const [name, operation] of Object.entries(operations)) {
    const scopes = operation.write ? [READ_SCOPE, WRITE_SCOPE] : [READ_SCOPE];
    server.registerTool(name, {
      description: operation.description, inputSchema: operation.schema,
      annotations: {
        readOnlyHint: !operation.write,
        destructiveHint: name.startsWith('delete_') || name.startsWith('update_'),
        idempotentHint: name !== 'create_tag' && name !== 'create_ai_response',
        openWorldHint: name === 'search_places' || name === 'create_ai_response',
      },
      _meta: { securitySchemes: [{ type: 'oauth2', scopes }] },
    }, async (input: unknown) => {
      try {
        const result = await operation.execute(context, input);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result) }], structuredContent: { data: result } };
      } catch (error) {
        const failure = publicError(error);
        return { isError: true, content: [{ type: 'text' as const, text: failure.message }],
          ...([401, 403].includes(failure.status) ? { _meta: { 'mcp/www_authenticate': [
            `Bearer resource_metadata="${metadataUrl}", error="insufficient_scope", scope="${scopes.join(' ')}"`,
          ] } } : {}),
        };
      }
    });
  }
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  try { return await transport.handleRequest(request); }
  finally { await server.close(); }
}

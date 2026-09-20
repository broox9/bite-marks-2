import { z } from 'zod';
import { operations, type BackendContext, type OperationName } from '$lib/use_cases/backend';
import { ApplicationError, READ_SCOPE, WRITE_SCOPE } from '$lib/core/domain/api';
import { errorResponse } from './errors';

export const routes: { method: string; path: string; operation: OperationName }[] = [
  { method: 'GET', path: 'spots', operation: 'list_spots' },
  { method: 'POST', path: 'spots', operation: 'save_spot' },
  { method: 'GET', path: 'spots/{id}', operation: 'get_spot' },
  { method: 'PATCH', path: 'spots/{id}', operation: 'update_spot' },
  { method: 'DELETE', path: 'spots/{id}', operation: 'delete_spot' },
  { method: 'GET', path: 'tags', operation: 'list_tags' },
  { method: 'POST', path: 'tags', operation: 'create_tag' },
  { method: 'GET', path: 'tags/{id}', operation: 'get_tag' },
  { method: 'PATCH', path: 'tags/{id}', operation: 'update_tag' },
  { method: 'DELETE', path: 'tags/{id}', operation: 'delete_tag' },
  { method: 'GET', path: 'places', operation: 'list_places' },
  { method: 'POST', path: 'places/search', operation: 'search_places' },
  { method: 'GET', path: 'places/{id}', operation: 'get_place' },
  { method: 'GET', path: 'me', operation: 'get_account' },
  { method: 'GET', path: 'me/preferences', operation: 'get_preferences' },
  { method: 'PUT', path: 'me/preferences', operation: 'update_preferences' },
  { method: 'POST', path: 'ai/responses', operation: 'create_ai_response' },
];

export async function readJson(request: Request) {
  const contentType = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json' && !contentType?.endsWith('+json')) {
    throw new ApplicationError(415, 'unsupported_media_type', 'Use application/json');
  }
  if (Number(request.headers.get('content-length')) > 128000) throw new ApplicationError(413, 'too_large', 'Request body is too large');
  const reader = request.body?.getReader();
  let length = 0;
  let content = '';
  const decoder = new TextDecoder();
  if (reader) try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 128000) { await reader.cancel(); throw new ApplicationError(413, 'too_large', 'Request body is too large'); }
      content += decoder.decode(value, { stream: true });
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(content + decoder.decode()) as unknown; }
  catch { throw new ApplicationError(400, 'invalid_json', 'Request body must be valid JSON'); }
}

export async function handleRest(request: Request, path: string, context: () => Promise<BackendContext>) {
  try {
    const segments = path.replace(/\/$/, '').split('/');
    const matches = routes.filter(route => {
      const pattern = route.path.split('/');
      return pattern.length === segments.length && pattern.every((part, index) => part === '{id}' || part === segments[index]);
    });
    // Prefer literal paths such as places/search over places/{id}.
    const exact = matches.filter(route => !route.path.includes('{id}'));
    const candidates = exact.length ? exact : matches;
    const route = candidates.find(route => route.method === request.method);
    if (!route) {
      if (candidates.length) return Response.json({ error: { code: 'method_not_allowed', message: 'Method not allowed' } }, {
        status: 405, headers: { Allow: candidates.map(route => route.method).join(', '), 'Cache-Control': 'no-store' },
      });
      throw new ApplicationError(404, 'not_found', 'Endpoint not found');
    }
    const ctx = await context();
    let input: unknown = ['GET', 'DELETE'].includes(request.method) ? Object.fromEntries(new URL(request.url).searchParams) : await readJson(request);
    if (route.path.includes('{id}')) {
      const id = segments[route.path.split('/').indexOf('{id}')];
      if (route.operation === 'update_spot') input = { id, data: input };
      else input = { ...z.record(z.string(), z.unknown()).parse(input), id };
    }
    const result = await operations[route.operation].execute(ctx, input);
    if (request.method === 'DELETE') return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
    const created = route.operation === 'create_tag' || (route.operation === 'save_spot' && !(result as { alreadyExisted: boolean }).alreadyExisted);
    return Response.json({ data: result }, { status: created ? 201 : 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return errorResponse(error); }
}

export function openApiDocument(siteUrl: string) {
  const paths: Record<string, Record<string, unknown>> = {};
  for (const route of routes) {
    const operation = operations[route.operation];
    const schema = z.toJSONSchema(operation.schema, { io: 'input', unrepresentable: 'any' });
    delete schema.$schema;
    const properties = { ...(schema.properties ?? {}) };
    delete properties.id;
    const parameters: unknown[] = route.path.includes('{id}') ? [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }] : [];
    if (route.method === 'GET') for (const [name, property] of Object.entries(properties)) parameters.push({ name, in: 'query', required: false, schema: property });
    const bodySchema = route.operation === 'update_spot' ? properties.data : { ...schema, properties, required: schema.required?.filter(key => key !== 'id') };
    (paths[`/${route.path}`] ??= {})[route.method.toLowerCase()] = {
      operationId: route.operation, summary: operation.description,
      security: [{ oauth: operation.write ? [READ_SCOPE, WRITE_SCOPE] : [READ_SCOPE] }, { websiteSession: [] }],
      parameters,
      ...(!['GET', 'DELETE'].includes(route.method) ? { requestBody: { required: true, content: { 'application/json': { schema: bodySchema } } } } : {}),
      responses: {
        [route.method === 'DELETE' ? '204' : '200']: { description: 'Success' },
        ...(['save_spot', 'create_tag'].includes(route.operation) ? { '201': { description: 'Created' } } : {}),
        '400': { description: 'Invalid input' }, '401': { description: 'Authentication required' },
        '403': { description: 'Insufficient permission' }, '404': { description: 'Resource not found' },
      },
    };
  }
  return { openapi: '3.1.0', info: { title: 'Bite Marks API', version: '1.0.0',
    description: 'Private data is scoped to the authenticated account. List responses use data.items and data.nextCursor. Other responses use data. Errors use error.code and error.message.' },
    servers: [{ url: `${siteUrl}/api/v1` }], paths,
    components: { securitySchemes: {
      oauth: { type: 'oauth2', flows: { authorizationCode: { authorizationUrl: `${siteUrl}/api/auth/oauth2/authorize`,
        tokenUrl: `${siteUrl}/api/auth/oauth2/token`, scopes: { [READ_SCOPE]: 'Read your data and search places', [WRITE_SCOPE]: 'Create, edit and delete your data' } } } },
      websiteSession: { type: 'apiKey', in: 'cookie', name: '__Secure-better-auth.convex_jwt', description: 'Existing HTTPS website session (development omits the __Secure- prefix); cookie writes also require a matching Origin header.' },
    } },
  };
}

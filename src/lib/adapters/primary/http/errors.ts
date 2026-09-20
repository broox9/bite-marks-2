import { ZodError } from 'zod';
import { ConvexError } from 'convex/values';
import { ApplicationError } from '$lib/core/domain/api';

export function publicError(error: unknown): ApplicationError {
  if (error instanceof ApplicationError) return error;
  if (error instanceof ZodError) return new ApplicationError(400, 'invalid_input', error.issues.map(i => `${i.path.join('.') || 'request'}: ${i.message}`).join('; '));
  if (error instanceof ConvexError && typeof error.data === 'object' && error.data !== null && 'code' in error.data) {
    const code = String(error.data.code);
    const status = code === 'unauthorized' ? 401 : ['forbidden', 'insufficient_scope'].includes(code) ? 403 : 400;
    return new ApplicationError(status, code, status === 401 ? 'Sign in required' : status === 403 ? 'Permission denied' : 'Invalid request');
  }
  // Convex's argument validation errors are not ConvexError instances.
  if (error instanceof Error && /ArgumentValidationError|Invalid cursor/.test(error.message)) {
    return new ApplicationError(400, 'invalid_input', 'Invalid identifier or pagination cursor');
  }
  return new ApplicationError(500, 'internal_error', 'The request could not be completed');
}
export function errorResponse(error: unknown, metadataUrl?: string) {
  const failure = publicError(error);
  return Response.json({ error: { code: failure.code, message: failure.message } }, {
    status: failure.status,
    headers: { 'Cache-Control': 'no-store', ...(metadataUrl && [401, 403].includes(failure.status) ? {
      'WWW-Authenticate': `Bearer resource_metadata="${metadataUrl}", error="${failure.status === 401 ? 'invalid_token' : 'insufficient_scope'}"`,
    } : {}) },
  });
}

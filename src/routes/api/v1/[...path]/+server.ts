import type { RequestHandler } from './$types';
import { backendForHttp } from '$lib/glue/backend.server';
import { handleRest } from '$lib/adapters/primary/http/rest';

const handle: RequestHandler = event => handleRest(event.request, event.params.path, () => backendForHttp(event));
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;

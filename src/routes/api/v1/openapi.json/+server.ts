import { canonicalSiteUrl } from '$lib/glue/backend.server';
import { openApiDocument } from '$lib/adapters/primary/http/rest';
export const GET = () => Response.json(openApiDocument(canonicalSiteUrl()));

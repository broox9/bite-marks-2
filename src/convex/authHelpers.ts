import type { MutationCtx, QueryCtx } from "./_generated/server";
import { ConvexError } from 'convex/values';
import { components } from './_generated/api';

export async function requireUserId(ctx: QueryCtx | MutationCtx, write = false): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError({ code: 'unauthorized', message: 'Unauthorized' });
  if (identity.biteConnector === true) {
    const scopes = typeof identity.scope === 'string' ? identity.scope.split(' ') : [];
    if (!scopes.includes('bite:read') || (write && !scopes.includes('bite:write'))) {
      throw new ConvexError({ code: 'insufficient_scope', message: 'Read-only connection' });
    }
    // Check live consent as well as signed claims, so revocation is immediate.
    const clientId = String(identity.azp ?? identity.client_id ?? '');
    const consent = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: 'connectorConsent',
      where: [
        { field: 'userId', value: identity.subject },
        { field: 'clientId', value: clientId },
      ],
    }) as { scopes?: string[] } | null;
    if (!consent?.scopes?.includes('bite:read') || (write && !consent.scopes.includes('bite:write'))) {
      throw new ConvexError({ code: 'insufficient_scope', message: 'Connection revoked or permission removed' });
    }
  }
  return identity.subject;
}

export function assertUser(expected: string, actual: string) {
  if (expected !== actual) throw new ConvexError({ code: 'forbidden', message: 'Forbidden' });
}

import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import type { AuthConfig } from "convex/server";

export default {
  providers: [getAuthConfigProvider(), ...['mcp', 'api/v1'].map(path => ({
    type: 'customJwt' as const,
    issuer: `${process.env.SITE_URL?.replace(/\/$/, '')}/api/auth`,
    applicationID: `${process.env.SITE_URL?.replace(/\/$/, '')}/${path}`,
    algorithm: 'RS256' as const,
    jwks: `${process.env.SITE_URL?.replace(/\/$/, '')}/api/auth/convex/jwks`,
  }))],
} satisfies AuthConfig;

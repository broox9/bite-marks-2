import { oauthProvider } from '@better-auth/oauth-provider';
import { jwt } from 'better-auth/plugins';

export function connectorPlugins(siteUrl: string) {
  const origin = siteUrl.replace(/\/$/, '');
  return [
    jwt({
      jwt: { issuer: `${origin}/api/auth`, expirationTime: '15m' },
      // The Convex Better Auth plugin exposes the shared key table at this path.
      // Using the same path also avoids its getJwks endpoint replacing /jwks.
      jwks: { jwksPath: '/convex/jwks', keyPairConfig: { alg: 'RS256' } },
      disableSettingJwtHeader: true,
    }),
    oauthProvider({
      loginPage: '/connect/login', consentPage: '/connect/consent',
      scopes: ['openid', 'profile', 'email', 'offline_access', 'bite:read', 'bite:write'],
      validAudiences: [`${origin}/mcp`, `${origin}/api/v1`],
      allowDynamicClientRegistration: true,
      allowUnauthenticatedClientRegistration: true,
      clientRegistrationDefaultScopes: ['openid', 'offline_access', 'bite:read', 'bite:write'],
      grantTypes: ['authorization_code', 'refresh_token'],
      accessTokenExpiresIn: 900,
      customAccessTokenClaims: () => ({ biteConnector: true }),
      schema: {
        oauthClient: { modelName: 'connectorClient' },
        oauthAccessToken: { modelName: 'connectorAccessToken' },
        oauthRefreshToken: { modelName: 'connectorRefreshToken' },
        oauthConsent: { modelName: 'connectorConsent' },
      },
    }),
  ];
}

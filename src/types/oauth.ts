// OAuth Types
export interface OAuthTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    scope?: string;
}

export interface OAuthTokenRequest {
    clientId: string;
    clientSecret: string;
    authorizationCode: string;
    redirectUri: string;
}

export interface OAuthRefreshRequest {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
}

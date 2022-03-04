export interface AuthResult {
    imageUrl: string;
    token: string;
    refreshToken: string;
    isAuthenticated: boolean;
    error: string;
}
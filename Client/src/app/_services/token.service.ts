import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth-token';
const REFRESHTOKEN_KEY = 'auth-refreshtoken';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() { }

  public saveTokens(token: string, refreshToken: string) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESHTOKEN_KEY, refreshToken);
  }

  public getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(REFRESHTOKEN_KEY);
  }

  public clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESHTOKEN_KEY);
  }

}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, ReplaySubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../business/user';
import { AuthResult } from '../_contracts/auth-result';
import { GoogleSigninService } from './google.service';
import { TokenService } from './token.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private subject = new ReplaySubject<User | null>(1);
    private isGoogleSignIn: boolean = false;

    constructor(private httpClient: HttpClient, private googleSignInService: GoogleSigninService, private tokenService: TokenService, private router: Router) {
        this.subject.next(this.getUser());
    }

    public observable(): Observable<User | null> {
        return this.subject.asObservable();
    }

    public async signIn(email: string, password: string) {
        let url = `${environment.authUri}/login`;
        try {
            await this.signInOrRegister(url, email, password);
        }
        catch (error: any) {
            this.clearAuthenticatedUser();
            this.handleError(error);
        }
    }

    public async signInGoogle() {
        try {
            const result = await this.googleSignInService.signin();
            this.saveAuthenticatedUser(result);
            this.isGoogleSignIn = true;
        }
        catch (error: any) {
            this.clearAuthenticatedUser();
            this.handleError(error);
        }
    }

    public async signOut() {

        if (!this.isLoggedIn()) {
            this.navigateToHome();
            return;
        }

        let url = `${environment.authUri}/logout`;
        try {
            await this.httpClient.post(url, {}).toPromise();

            if (this.isGoogleSignIn) {
                await this.googleSignInService.signout();
                this.isGoogleSignIn = false;
            }
        }
        catch (error: any) {
            this.handleError(error);
        }
        finally {
            this.clearAuthenticatedUser();
            this.navigateToHome();
        }
    }

    public async register(email: string, password: string) {
        let url = `${environment.authUri}/register`;
        try {
            await this.signInOrRegister(url, email, password);
        }
        catch (error: any) {
            this.clearAuthenticatedUser();
            this.handleError(error);
        }
    }

    public refresh(): Observable<AuthResult> {
        let url = `${environment.authUri}/refresh`;

        var headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });

        var body = JSON.stringify({
            token: this.tokenService.getToken(),
            refreshToken: this.tokenService.getRefreshToken()
        });

        return this.httpClient.post<AuthResult>(url, body, { headers }).pipe(
            tap(result => {
                if (result.isAuthenticated){
                    this.tokenService.saveTokens(result.token, result.refreshToken);
                }
            }),
            catchError ((error) => {
                this.clearAuthenticatedUser();
                return throwError(error);
             })
        );
    }

    public isLoggedIn(): boolean {
        return this.tokenService.getToken() !== null && this.tokenService.getRefreshToken() !== null;
    }

    private async signInOrRegister(url: string, email: string, password: string) {
        var headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });

        var body = JSON.stringify({
            email: email,
            password: password
        });

        var result = await this.httpClient.post<AuthResult>(url, body, { headers }).toPromise();
        this.saveAuthenticatedUser(result);
    }

    private saveAuthenticatedUser(result: AuthResult) {
        if (result.isAuthenticated) {
            this.tokenService.saveTokens(result.token, result.refreshToken);
            this.saveUser(result.imageUrl);
        }
        else {
            this.clearAuthenticatedUser();
        }        
    }

    private clearAuthenticatedUser() {
        this.tokenService.clearTokens();
        this.clearUser();
    }

    private saveUser(imageUrl: string) {
        if (imageUrl !== "") {
            const user = new User(imageUrl);
            localStorage.setItem("user", JSON.stringify(user));
            this.subject.next(user);
        }
        else {
            this.clearUser();
        }
    }

    private getUser(): User | null {
        const userJson: string | null = localStorage.getItem("user");
        const user: User | null = userJson !== null ? JSON.parse(userJson) : null;
        return user;
    }

    private clearUser() {
        localStorage.removeItem("user");
        this.subject.next(null);
    }

    private handleError(error: any){
        if (error.error.error) {
            throw error.error.error;
        }
        throw "Error code: " + error.status;
    }

    private navigateToHome() {
        if (this.router.url == "/my-files") {
            this.router.navigateByUrl('/')
        } 
    }
}
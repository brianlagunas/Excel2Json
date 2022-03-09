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
        var headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
        var body = JSON.stringify({
            email: email,
            password: password
        });

        try {    
            var result = await this.httpClient.post<AuthResult>(url, body, { headers }).toPromise();
            this.saveAuthenticatedUser(result);
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
        var headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
        var body = JSON.stringify({
            email: email,
            password: password
        });

        try {    
            await this.httpClient.post(url, body, { headers }).toPromise();
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

    public async confirmEmail(id: string, token: string): Promise<boolean> {
        let url = `${environment.authUri}/confirm`;
        var headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
        var body = JSON.stringify({
            id: id,
            token: token
        });

        try{
            await this.httpClient.post(url, body, { headers }).toPromise();
        }
        catch (error: any) {
            this.handleError(error);
        }

        return false;
    }

    public async sendConfirmationEmail(email: string) {
        let url = `${environment.authUri}/send-confirmation-email`;
        var headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
        var body = JSON.stringify({
            email: email
        });

        try{
            await this.httpClient.post(url, body, { headers }).toPromise();
        }
        catch (error: any) {
            this.handleError(error);
        }
    }

    public async sendPasswordResetEmail(email: string) {
        let url = `${environment.authUri}/send-password-reset-email`;
        var headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
        var body = JSON.stringify({
            email: email
        });

        try{
            await this.httpClient.post(url, body, { headers }).toPromise();
        }
        catch (error: any) {
            this.handleError(error);
        }
    }

    public async resetPassword(email: string, password: string, token: string) {
        let url = `${environment.authUri}/reset-password`;
        var headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
        var body = JSON.stringify({
            email: email,
            password: password,
            token: token
        });

        try{
            await this.httpClient.post(url, body, { headers }).toPromise();
        }
        catch (error: any) {
            this.handleError(error);
        }
    }

    public isLoggedIn(): boolean {
        return this.tokenService.getToken() !== null && this.tokenService.getRefreshToken() !== null;
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
        //auth result error
        if (error.error.error) {
            throw error.error.error;
        }
        //standard response error
        else if (error.error) {
            throw error.error;
        }
        throw "Error code: " + error.status;
    }

    private navigateToHome() {
        if (this.router.url == "/account/my-files") {
            this.router.navigateByUrl('/')
        } 
    }
}
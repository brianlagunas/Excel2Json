import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../business/user';
import { GoogleSigninService } from './google-signin.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private subject = new ReplaySubject<User | null>(1);
    private isGoogleSignIn: boolean = false;

    constructor(private httpClient: HttpClient, private googleSignInService: GoogleSigninService) {
        this.subject.next(this.getSignedInUser());
    }

    public observable(): Observable<User | null> {
        return this.subject.asObservable();
    }

    public async signIn(email: string, password: string) {
        let url = `${environment.authUri}/login`;
        await this.signInOrRegister(url, email, password);
    }

    public async signInGoogle() {
        const user = await this.googleSignInService.signin();
        this.setUser(user);
        this.isGoogleSignIn = true;
    }

    public async signOut() {
        this.clearUser();

        if (this.isGoogleSignIn) {
            await this.googleSignInService.signout();
            this.isGoogleSignIn = false;
        }
    }

    public async register(email: string, password: string) {
        let url = `${environment.authUri}/register`;
        await this.signInOrRegister(url, email, password);
    }

    public getSignedInUser() : User | null {
        const userJson: string | null = localStorage.getItem("user");
        const user: User | null = userJson !== null ? JSON.parse(userJson) : null;
        return user;
    }

    private async signInOrRegister(url: string, email: string, password: string) {
        var headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});

        var body = JSON.stringify({
            email: email,
            password: password
        });

        var user = await this.httpClient.post<User>(url, body, { headers }).toPromise();             
        this.setUser(user);
    }

    private setUser(user: User | null) {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
            this.subject.next(user);
        }
        else {
            this.clearUser();
        }
    }

    private clearUser() {
        localStorage.removeItem("user");
        this.subject.next(null);
    }
}
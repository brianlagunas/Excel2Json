import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    constructor(private httpClient: HttpClient) {}

    public async signIn(email: string, password: string) {
        let url = `${environment.authUri}/login`;
        await this.signInOrRegister(url, email, password);
    }

    public signOut() {

    }

    public async register(email: string, password: string) {
        let url = `${environment.authUri}/register`;
        await this.signInOrRegister(url, email, password);
    }

    public async signInOrRegister(url: string, email: string, password: string) {
        var headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});

        var body = JSON.stringify({
            email: email,
            password: password
        });

        var result = await this.httpClient.post<any>(url, body, { headers }).toPromise();
        localStorage.setItem("token", result.token);
    }
}
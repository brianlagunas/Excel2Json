import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    constructor(private httpClient: HttpClient) {}

    public signIn() {

    }

    public signOut() {

    }

    public async register(email: string, password: string) {
        let url = `${environment.authUri}/register`;

        var headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});

        var body = JSON.stringify({
            email: email,
            password: password
        });

        var result = await this.httpClient.post<any>(url, body, { headers }).toPromise();
        localStorage.setItem("token", result.token);
    }
}
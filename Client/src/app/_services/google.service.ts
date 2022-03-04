import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthResult } from '../_contracts/auth-result';

@Injectable({
  providedIn: 'root'
})
export class GoogleSigninService {

  private auth2!: gapi.auth2.GoogleAuthBase;

  constructor(private httpClient: HttpClient, private ngZone: NgZone) {
  }

  public async signin(): Promise<AuthResult> {
    await this.ensureGapiLoaded();
    const user = await this.auth2.signIn();
    return this.validateGoogleLogin(user);
  }

  public async signout(): Promise<void> {
      await this.auth2.signOut();
  }

  async validateGoogleLogin(user: gapi.auth2.GoogleUser): Promise<AuthResult> {
    var id_token = user.getAuthResponse().id_token;

    let url = `${environment.authUri}/google/`;
    var headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    var body = JSON.stringify({
        token: id_token
    });

    return this.httpClient.post<AuthResult>(url, body, { headers }).toPromise();
  }

  ensureGapiLoaded(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.auth2 != null) {
        resolve();
      } else {
        this.loadGapi().then(() => {
          this.initClient().then((auth) => {
            this.auth2 = auth;
            resolve();
          }, reject);
        }, reject);
      }
    });
  }

  loadGapi(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.ngZone.run(() => {
        gapi.load('auth2', {
          callback: resolve,
          onerror: reject,
          timeout: 5000, // 5 seconds.
          ontimeout: reject
        });
      });
    });
  }

  initClient(): Promise<gapi.auth2.GoogleAuthBase> {
    return new Promise<gapi.auth2.GoogleAuthBase>((resolve, reject) => {
      this.ngZone.run(() => {
        gapi.auth2.init({
          client_id: "400613385752-qt314c2r0dbnlkdrg6bmm1vave3nmsos.apps.googleusercontent.com"
        }).then(resolve, reject);
      });
    });
  }
}


import { Injectable, NgZone } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from '../business/user';

@Injectable({
  providedIn: 'root'
})
export class GoogleSigninService {

  private auth2!: gapi.auth2.GoogleAuthBase;

  constructor(private ngZone: NgZone) {
    //this.initialize();
  }

  // public async initialize() {
  //   await this.ensureGapiLoaded();
  // }

  public async signin(): Promise<User | null> {
    try {
      await this.ensureGapiLoaded();
      const user = await this.auth2.signIn();
      const clientUser = await this.validateGoogleLogin(user);
      return clientUser;
    }
    catch {
      return null;
    }
  }

  public async signout(): Promise<void> {
      await this.auth2.signOut();
  }

  async validateGoogleLogin(user: gapi.auth2.GoogleUser): Promise<User> {
    var id_token = user.getAuthResponse().id_token;

    let url = `${environment.authUri}/google/`;
    let params = {
      headers: {
        "content-type": "application/json; charset=utf-8"
      },
      method: "POST",
      body: JSON.stringify({ token: id_token })
    }
    var resp = await fetch(url, params);
    var result = await resp.json();

    let clientUser: User = {
      imageUrl: result.imageUrl,
      token: result.token
    }

    return clientUser;
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


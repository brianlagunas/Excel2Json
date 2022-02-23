import { Injectable, NgZone } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../business/user';

@Injectable({
  providedIn: 'root'
})
export class GoogleSigninService {

  private auth2!: gapi.auth2.GoogleAuthBase;
  private subject = new ReplaySubject<User | null>(1);

  constructor(private ngZone: NgZone) {
    this.initialize();
  }

  public observable(): Observable<User | null> {
    return this.subject.asObservable();
  }

  public async initialize() {
    //TODO: check for valid token, if not valid sign the user out
    await this.ensureGapiLoaded();
    const isSignedIn = this.auth2.isSignedIn.get();
    if (isSignedIn) {
      const user: User = JSON.parse(localStorage.getItem("user")!);
      this.subject.next(user);
    }
    else {
      this.subject.next(null);
    }
  }

  public signin() {
    this.ngZone.run(async () => {
      try {
        const user = await this.auth2.signIn();
        this.validateToken(user);
        this.createUser(user);
      }
      catch {
        this.subject.next(null);
      }
    });
  }

  public signout() {
    this.ngZone.run(async () => {
      await this.auth2.signOut();
      this.subject.next(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    });
  }

  async validateToken(user: gapi.auth2.GoogleUser) {
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

    localStorage.setItem("token", result.token);
  }

  private createUser(user: gapi.auth2.GoogleUser) {
    const profile = user.getBasicProfile();
    let newUser: User = {
      name: profile.getName(),
      image: profile.getImageUrl(),
    };
    this.subject.next(newUser);

    localStorage.setItem("user", JSON.stringify(newUser));
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


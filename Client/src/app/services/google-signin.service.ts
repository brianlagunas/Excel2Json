import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleSigninService {

  private auth2!: gapi.auth2.GoogleAuth;
  private subject = new ReplaySubject<gapi.auth2.GoogleUser | null>(1);

  constructor() { 
    gapi.load("auth2", () => {
      this.auth2 = gapi.auth2.init({
        client_id: "400613385752-qt314c2r0dbnlkdrg6bmm1vave3nmsos.apps.googleusercontent.com"
      });
    })
  }

  public signin() {
    this.auth2.signIn({
      //scope
    }).then(user => {
      this.serverLogInTest(user);
      this.subject.next(user);
    }).catch(() => {
      this.subject.next(null);
    });
  }

  public signout() {
    this.auth2.signOut().then( () => {
      this.subject.next(null);
      localStorage.removeItem("token");
    });
  }

  public observable(): Observable<gapi.auth2.GoogleUser | null> {
    return this.subject.asObservable();
  }

  async serverLogInTest(user: gapi.auth2.GoogleUser) {
    var token = user.getAuthResponse().id_token;

    let url = `${environment.authUri}/google/`;
    let params = {
      headers: {
        "content-type": "application/json; charset=utf-8"
      },
      method: "POST",
      body: JSON.stringify(token)
    }
    var resp = await fetch(url, params);
    var result = await resp.json();
    localStorage.setItem("token", result.token);
  }
}

import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

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
      this.subject.next(user);
    }).catch(() => {
      this.subject.next(null);
    });
  }

  public signout() {
    this.auth2.signOut().then( () => {
      this.subject.next(null);
    });
  }

  public observable(): Observable<gapi.auth2.GoogleUser | null> {
    return this.subject.asObservable();
  }
}

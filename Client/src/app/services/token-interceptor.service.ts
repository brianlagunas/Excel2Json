import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  constructor(private router: Router, private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const user = this.authService.getSignedInUser();
    if (user) {
      let tokenizedReq = req.clone({
        setHeaders: {
          Authorization: "Bearer " + user.token
        }
      });

      return next.handle(tokenizedReq);
    }
    else {
      return next.handle(req).pipe(
        catchError((error, catchError) => {
          if (error instanceof HttpErrorResponse) {
            if (error.status === 401 || error.status === 403) {
              console.log("Unauthorized, redirect to login");
              this.handle401();
            }
          }
          return throwError(error);
        })
      );
    }
  }

  handle401() {
    this.authService.signOut();
    this.router.navigateByUrl("/"); //redirect to login screen
  }
}

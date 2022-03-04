import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { resourceLimits } from 'worker_threads';
import { AuthService } from '../_services/auth.service';
import { TokenService } from '../_services/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private tokenService: TokenService, private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.tokenService.getToken();
    if (token) {
      req = this.addTokenHeader(req, token);
    }

    return next.handle(req).pipe(catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return this.handle401Error(req, next);
      }
      else {
        return throwError(error);
      }
    }));
  }

  private addTokenHeader(req: HttpRequest<any>, token: string) {
    return req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      
      return this.authService.refresh().pipe(
        switchMap(result => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(result.token);
          return next.handle(this.addTokenHeader(request, result.token));          
        }),
        catchError (error => {
          this.isRefreshing = false;   
            this.authService.signOut();
            return throwError(error);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(token => next.handle(this.addTokenHeader(request, token)))
    );
  }
}

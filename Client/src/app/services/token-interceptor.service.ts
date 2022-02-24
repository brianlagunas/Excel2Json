import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor{

  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    let token = localStorage.getItem("token");
    if (token) {
      let tokenizedReq = req.clone({
        setHeaders: {
          Authorization: "Bearer " + token
        }
      });

      return next.handle(tokenizedReq);
    }
    else {
      return next.handle(req);
    }
  }
}

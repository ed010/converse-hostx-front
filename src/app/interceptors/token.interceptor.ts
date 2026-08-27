import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpClient,
} from "@angular/common/http";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, filter, switchMap, take } from "rxjs/operators";
import { RefreshTokenResponse } from "../models/merchant-login-response.model";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private router: Router, private http: HttpClient) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (this.shouldSkipToken(req)) {
      return next.handle(req);
    }

    const isAdmin = this.router.url.includes("admin");
    const authReq = this.addToken(req);

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (isAdmin) {
          if (err.status === 401 || err.status === 403) {
            localStorage.removeItem("token");
            this.router.navigateByUrl("adminLogin");
          }
          return throwError(err);
        }

        if (err.status === 401) {
          return this.refreshAndRetry(req, next);
        }

        return throwError(err);
      })
    );
  }

  private shouldSkipToken(req: HttpRequest<unknown>): boolean {
    return (
      req.url.includes("/api/Login/Login") ||
      req.url.includes("/api/Login/LoginAdmin") ||
      req.url.includes("/api/Login/RefreshToken")
    );
  }

  private addToken(req: HttpRequest<unknown>): HttpRequest<unknown> {
    const token = localStorage.getItem("token");
    if (!token) {
      return req;
    }

    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private refreshAndRetry(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const refreshToken = localStorage.getItem("tokenr");
    if (!refreshToken) {
      this.logout();
      return throwError(
        new HttpErrorResponse({ status: 401, statusText: "Unauthorized" })
      );
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.http
        .post<RefreshTokenResponse>("/api/Login/RefreshToken", {
          refreshToken,
        })
        .pipe(
          switchMap((res) => {
            this.isRefreshing = false;
            localStorage.setItem("token", res.token);
            localStorage.setItem("tokenr", res.refreshToken);
            this.refreshTokenSubject.next(res.token);
            return next.handle(this.addToken(req));
          }),
          catchError((err) => {
            this.isRefreshing = false;
            this.logout();
            return throwError(err);
          })
        );
    }

    return this.refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap(() => next.handle(this.addToken(req)))
    );
  }

  private logout(): void {
    localStorage.removeItem("tokenr");
    localStorage.removeItem("token");
    this.router.navigateByUrl("");
  }
}

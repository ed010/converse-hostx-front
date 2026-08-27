import { Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable()
export class BaseUrlInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const raw = environment.apiBaseUrl?.trim() ?? "";
    if (!raw) {
      return next.handle(req);
    }

    const baseUrl = raw.replace(/\/+$/, "");
    let url = req.url;

    if (/^https?:\/\//i.test(url)) {
      return next.handle(req);
    }

    if (url.startsWith("/assets/")) {
      return next.handle(req);
    }

    const path = url.startsWith("/") ? url : `/${url}`;
    url = `${baseUrl}${path}`;

    return next.handle(req.clone({ url }));
  }
}

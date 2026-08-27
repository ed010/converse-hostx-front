import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Login } from "../models/login.model";
import {
  MerchantLoginResponse,
  RefreshTokenResponse,
} from "../models/merchant-login-response.model";

/** Temporary mock until backend drops firebaseToken validation. */
const MOCK_FIREBASE_TOKEN = "mock-firebase-token";

@Injectable({
  providedIn: "root",
})
export class LoginService {
  constructor(private http: HttpClient) {}

  Authentify(login: Login) {
    return this.http.post<{ token: string }>(`/api/Login/LoginAdmin`, login);
  }

  refreshToken(refreshToken: string) {
    return this.http.post<RefreshTokenResponse>(`/api/Login/RefreshToken`, {
      refreshToken,
    });
  }

  /** Merchant user login — no real Firebase; mock header for backend validation. */
  login(login: Login) {
    const headers = new HttpHeaders().set(
      "firebaseToken",
      MOCK_FIREBASE_TOKEN
    );
    return this.http.post<MerchantLoginResponse>(`/api/Login/Login`, login, {
      observe: "body",
      headers,
    });
  }

  isAuthenticated(res: MerchantLoginResponse): boolean {
    return !!res?.token;
  }

  saveSession(res: MerchantLoginResponse): void {
    localStorage.setItem("token", res.token ?? "");
    localStorage.setItem("tokenr", res.refreshToken ?? "");
    localStorage.setItem("id", res.merchantUserId ?? "");
  }
}

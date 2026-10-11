import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  GooglePayConfig,
  ProcessGooglePay,
  ProcessGooglePayResponse,
} from "../models/google-pay/google-pay.model";

const GOOGLE_PAY_SCRIPT_URL = "https://pay.google.com/gp/p/js/pay.js";

@Injectable({
  providedIn: "root",
})
export class GooglePayService {
  private scriptPromise: Promise<void> | null = null;

  constructor(private http: HttpClient) {}

  getConfig(transactionHash: string) {
    return this.http.get<GooglePayConfig>("/api/Payment/GooglePayConfig", {
      params: { transactionHash },
    });
  }

  processGooglePayTransaction(body: ProcessGooglePay) {
    return this.http.post<ProcessGooglePayResponse>(
      "/api/Payment/ProcessGooglePayTransaction",
      body
    );
  }

  /** Loads Google's pay.js once, only on the pages that show the button. */
  loadScript(): Promise<void> {
    if ((window as any).google?.payments?.api) {
      return Promise.resolve();
    }
    if (!this.scriptPromise) {
      this.scriptPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = GOOGLE_PAY_SCRIPT_URL;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
          this.scriptPromise = null;
          script.remove();
          reject(new Error("Google Pay script failed to load"));
        };
        document.head.appendChild(script);
      });
    }
    return this.scriptPromise;
  }
}

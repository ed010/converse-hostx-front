import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { RegisterApplePayModel } from "../models/apple-pay/RegisterApplePay.model";
import { UnregisterApplePayModel } from "../models/apple-pay/UnregisterApplePay.model";
import { ProcessApplePay } from "../models/apple-pay/ProcessApplePay.model";

@Injectable({
  providedIn: "root",
})
export class ApplePayService {
  constructor(private http: HttpClient) {}

  registerMerchant(body: RegisterApplePayModel) {
    return this.http.post("/api/Merchant/RegisterMerchantToApplePay", body, {
      observe: "response",
    });
  }

  unergisterMerchant(body: UnregisterApplePayModel) {
    return this.http.post(
      "/api/Merchant/UnregisterMerchantFromApplePay",
      body,
      { observe: "response" }
    );
  }

  getMerchantApplePayDetails(id: string) {
    return this.http.get(
      `/api/Merchant/GetMerchantApplePayDetails?merchantId=${id}`,
      { observe: "response" }
    );
  }

  validateMerchant(merchantIdentifier: string) {
    return this.http.post<any>("/api/Payment/GetSessionToken", {
      merchantIdentifier,
    });
  }

  processApplePayTransaction(data: any) {
    return this.http.post<any>("/api/Payment/ProcessApplepayTransaction", data);
  }
}

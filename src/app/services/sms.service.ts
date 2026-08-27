import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { SmsHistoryPage } from "../models/smsHistory.model";

@Injectable({
  providedIn: "root",
})
export class SmsService {
  constructor(private http: HttpClient) {}

  sendSMS(body) {
    return this.http.post(`/api/Payment/SendSms`, body, {
      observe: "response",
    });
  }

  sendSMSEmail(transferId, email) {
    let lang = localStorage.getItem("lang");
    let sendData = {
      transferId: transferId,
      email: email,
      lang: lang ? lang : "en",
    };
    return this.http.post(`/api/Payment/SendEmailReciept`, sendData);
  }

  getSMShistory(params: {
    merchantId?: number | string;
    page?: number;
    count?: number;
  } = {}): Observable<SmsHistoryPage> {
    let httpParams = new HttpParams()
      .set("page", String(params.page || 1))
      .set("count", String(params.count || 50));

    if (
      params.merchantId !== null &&
      params.merchantId !== undefined &&
      params.merchantId !== ""
    ) {
      httpParams = httpParams.set("merchantId", String(params.merchantId));
    }

    return this.http.get<SmsHistoryPage>(`/api/v1/Merchant/GetSMSHistories`, {
      params: httpParams,
    });
  }
}

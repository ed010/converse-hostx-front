import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GetTransactionByHashResponse } from "../models/get-transaction-by-hash.model";
import { PaymentPayRequest } from "../models/payment-pay-request.model";
import {
  getStoredLanguageCode,
  normalizeLanguageCode,
} from "../utils/language.util";

/** Legacy envelope still expected by payment / make-payment components */
export type GetTransactionLegacyBody = {
  transaction: any;
  merchantUser: any;
};

@Injectable({
  providedIn: "root",
})
export class PaymentService {
  constructor(private http: HttpClient) {}

  getTransactions() {
    return this.http.get(`/api/Payment/GetTransactions?id=41`, {
      observe: "response",
    });
  }

  /**
   * Loads payment context by transaction hash. Normalizes the compact API body
   * into `{ transaction, merchantUser }` for existing screens.
   */
  getTransaction(
    transactionHash: string,
    merchantUserId?: string | null
  ): Observable<HttpResponse<GetTransactionLegacyBody>> {
    let params = new HttpParams().set("TransactionHash", transactionHash);
    if (merchantUserId != null && String(merchantUserId).trim() !== "") {
      params = params.set("MerchantUserId", String(merchantUserId).trim());
    }
    return this.http
      .get<GetTransactionByHashResponse | GetTransactionLegacyBody>(
        `/api/payment/gettransactionbytransactionhash`,
        { params, observe: "response" }
      )
      .pipe(
        map((res: HttpResponse<GetTransactionByHashResponse | GetTransactionLegacyBody>) => {
          const body = res.body as any;
          if (body?.transaction != null) {
            body.transaction.language = this.resolveUiLanguage(
              body.transaction.language
            );
            return res as HttpResponse<GetTransactionLegacyBody>;
          }
          const mapped = this.mapHashResponseToLegacyBody(
            body as GetTransactionByHashResponse,
            transactionHash,
            merchantUserId
          );
          return res.clone({ body: mapped });
        })
      );
  }

  /** Maps API language to ngx-translate locale; Armenian is always `am`. */
  private resolveUiLanguage(language?: string | null): string {
    const raw = language != null ? String(language).trim() : "";
    if (raw !== "") {
      return normalizeLanguageCode(raw);
    }
    return getStoredLanguageCode();
  }

  private mapHashResponseToLegacyBody(
    b: GetTransactionByHashResponse | null | undefined,
    transactionHash: string,
    merchantUserId?: string | null
  ): GetTransactionLegacyBody {
    const logo = b?.logo != null ? String(b.logo) : " ";
    const amount = Number(b?.amount ?? 0);
    const comment = String(b?.comment ?? "");
    const canChangeComment = !!b?.canChangeComment;
    const transferId = Number(b?.transferId ?? 0);
    const currency = String(b?.currency ?? "AMD");
    const language = this.resolveUiLanguage(b?.language);
    const transactionStatus = Number(b?.status ?? 0);
    const isBlocked = !!b?.isBlocked;
    const isMulti = !!b?.isMulti;
    const merchantName = String(b?.merchantName ?? "").trim();
    const idFromQuery = String(merchantUserId ?? "").trim();
    const idFromBody = String(b?.merchantUserId ?? "").trim();
    const resolvedMerchantUserId = idFromQuery || idFromBody;

    const emptyMerchantInfo = {
      companyNameHy: "",
      companyNameRu: "",
      companyNameEn: merchantName,
      logo,
      addressHy: "",
      addressEn: "",
      legalCompanyName: "",
      legalAddress: "",
      tin: "",
      phone: "",
      bankSerialNumber: "",
      website: "",
      email: "",
      smsPhone: "",
      director: "",
    };

    return {
      transaction: {
        logo,
        amount,
        comment,
        canChangeComment,
        language,
        isBlocked,
        transactionStatus,
        isMulti,
        qr: "",
        link: "",
        transactionId: transferId,
        currency,
        createDate: new Date(),
        transactionDate: new Date(),
        transactionType: 0,
        merchantId: 0,
        authCode: "",
        bankTid: "",
        bankName: "",
        bankFee: 0,
        payxFee: 0,
        transactionOutOrLocal: 0,
        merchantName,
        merchantUsername: "",
        hashOrderId: transactionHash,
        card: {
          maskedPan: "",
          expiryDate: 0,
          cardHolderName: "",
        },
      },
      merchantUser: {
        merchantUserId: resolvedMerchantUserId,
        merchantInfo: emptyMerchantInfo,
        canGenerateQR: false,
        canGenerateMultiQR: false,
        canReverse: false,
        canRefund: false,
        isGeneralUser: false,
        isBlocked,
        merchants: [],
        merchant: 0,
        canChangeComment,
        username: "",
        password: "",
      },
    };
  }

  pay(body: PaymentPayRequest, lang?: string | null) {
    let headers = new HttpHeaders().set("Content-Type", "application/json");
    const normalizedLang = normalizeLanguageCode(
      lang,
      getStoredLanguageCode()
    );
    if (normalizedLang !== "") {
      headers = headers.set("lang", normalizedLang);
    }
    return this.http.post(`/api/payment/pay`, body, {
      headers,
      observe: "response",
    });
  }

  getPaymentReciept(id) {
    let params = new HttpParams().set("transferId", id.toString());
    return this.http.get(`/api/Payment/GetPaymentReciept`, {
      observe: "response",
    });
  }
}

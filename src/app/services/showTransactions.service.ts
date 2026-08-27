import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ShowTransactionsService {
  constructor(private http: HttpClient) {}
  getTransactions(id) {
    return this.http.get(`/api/Payment/GetTransactions`);
  }
  getTransaction(id) {
    return this.http.get(`/api/Payment/GetTransaction?transferId=${id}`, {
      observe: "response",
    });
  }
  endTransactionsForExcel(body) {
    // const headers = new HttpHeaders().set('Content-Type', 'xlxx');
    return this.http.post(`/api/Payment/GetTransactionsForExcel`, body, {
      responseType: "blob",
    });
  }
  endTransactionsForExcelNew(body) {
    return this.http.post(`/api/Payment/GetTransactionsForUserExcel`, body, {
      responseType: "blob",
    });
  }

  exportTransactionsExcel(body: {
    id: number;
    page: number;
    count: number;
    status: number | null;
    start: string;
    end: string;
  }) {
    return this.http.post(`/api/Payment/ExportTransactionsExcel`, body, {
      responseType: "blob",
    });
  }

  exportTransactionForAdmin(body: {
    pageNumber: number;
    count: number;
    startDate: string;
    endDate: string;
    status: number | null;
  }) {
    return this.http.post(`/api/Payment/ExportTransactionForAdmin`, body, {
      responseType: "blob",
    });
  }
  getTransactionForAdmin() {
    return this.http.get(`/api/Payment/GetTransactionsAdmin`, {
      observe: "response",
    });
  }

  reverseTransaction(transactionId: number) {
    const params = new HttpParams().set(
      "transactionId",
      transactionId.toString()
    );
    return this.http.post(`/api/Payment/Reverse`, null, {
      observe: "response",
      params,
    });
  }

  refundTransaction(amount: number, transactionId: number) {
    const params = new HttpParams()
      .set("amount", amount.toString())
      .set("transactionId", transactionId.toString());
    return this.http.post(`/api/Payment/Refund`, null, {
      observe: "response",
      params,
    });
  }

  getRefundHistory(transactionId: number) {
    return this.http.get<
      { id: number; transactionId: number; amount: number; date: string }[]
    >(`/api/Payment/GetRefundHistory`, {
      params: { transactionId: transactionId.toString() },
    });
  }

  getTransactionByPage(page, count) {
    return this.http.get(
      `/api/Payment/GetTransactionsByPage?page=${page}&count=${count}`,
      {
        observe: "response",
      }
    );
  }
  getTransactionFilterByPage(page, size, filters) {
    const keys = filters?.keys || {};
    const body = {
      page: this.toPositiveNumber(page, 1),
      size: this.toPositiveNumber(size, 100),
      transactionId: this.toNumber(keys["transactions.id"]),
      amount: this.toNumber(keys["amount"]),
      merchantId: this.toNumber(keys["merchant_id"]),
      companyNameEn: this.toNullableString(keys["company_name_en"]),
      authCode: this.toNullableString(keys["auth_code"]),
      bankTid: this.toNullableString(keys["bank_tid"]),
      cardNumber: this.toNullableString(keys["card_number"]),
      comment: this.toNullableString(keys["comment"]),
      appName: this.toNullableString(keys["app_name"]),
      transactionType: this.toNumber(keys["transaction_type"]),
      transactionOutOrLocal: this.toNumber(keys["transaction_out_or_local"]),
      transactionStatus: this.toNumber(keys["transaction_status"]),
      creationDateStart: this.toNullableValue(filters?.creationDateStart),
      creationDateEnd: this.toNullableValue(filters?.creationDateEnd),
      paymentDateStart: this.toNullableValue(filters?.paymentDateStart),
      paymentDateEnd: this.toNullableValue(filters?.paymentDateEnd),
    };

    return this.http.post(
      `/api/Payment/SearchTransactions`,
      body,
      {
        observe: "response",
      }
    );
  }

  private toNumber(value) {
    const numericValue = Number(value);
    return value === "" || value == null || Number.isNaN(numericValue)
      ? null
      : numericValue;
  }

  private toNullableString(value) {
    return value === "" || value == null ? null : value;
  }

  private toNullableValue(value) {
    return value === "" || value == null ? null : value;
  }

  private toPositiveNumber(value, fallback) {
    const numericValue = Number(value);
    return Number.isInteger(numericValue) && numericValue > 0
      ? numericValue
      : fallback;
  }

  getHosXTransactionFilterByPage(page, count, filters) {
    let body = filters;
    return this.http.post(
      `/api/Payment/SearchOutsideTransactions?page=${page}&count=${count}`,
      body,
      {
        observe: "response",
      }
    );
  }

  blockTransaction(transactionId: number) {
    return this.http.post(
      `/api/Payment/BlockTransaction`,
      { transactionId },
      { observe: "response" }
    );
  }

  checkStatus(id) {
    return this.http.get(`/api/Payment/CheckStatus?orderId=${id}`);
  }
}

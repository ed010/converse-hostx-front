import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MerchantIdTitle } from '../models/merchantIdTitle';
import { MerchantUserClientView } from '../models/merchant-user-client.model';
import { DataExchangeService } from './dataExchange.service';

@Injectable({
  providedIn: 'root'
})
export class GetMerchantForUserService {

  id = +localStorage.getItem('id');
  token = localStorage.getItem('token');
  constructor(private http: HttpClient, private dataEx: DataExchangeService) { }

  /** API may send permission flags as booleans or 0/1 (sometimes as strings). */
  private normalizeFlag(value: unknown): boolean {
    return value === true || value === 1 || value === '1';
  }

  /**
   * Maps current API shape (nested `merchantEntity`, `canGenerateMulti` / `canGenerateQr`, user `id`)
   * onto the fields the UI still expects from the legacy response.
   */
  private normalizeMerchantUser(raw: any): MerchantUserClientView {
    if (!raw || typeof raw !== 'object') {
      return raw;
    }
    const entity = raw.merchantEntity;
    const merchantInfo =
      raw.merchantInfo ?? entity?.merchantInfo ?? null;

    let merchants: MerchantIdTitle[] = [];
    if (Array.isArray(raw.merchants) && raw.merchants.length > 0) {
      merchants = raw.merchants.map((m: any) => ({
        id: m.id ?? m.merchantId,
        title:
          m.title ??
          m.companyNameEn ??
          m.companyNameHy ??
          String(m.id ?? m.merchantId ?? ''),
      }));
    } else if (entity != null && (entity.merchantId != null || raw.merchantId != null)) {
      const mid = entity.merchantId ?? raw.merchantId;
      const mi = entity.merchantInfo;
      const title =
        mi?.companyNameEn ||
        mi?.companyNameHy ||
        mi?.companyNameRu ||
        `Merchant ${mid}`;
      merchants = [{ id: mid, title }];
    }

    const fromRoot = Array.isArray(raw.currencies) ? raw.currencies : [];
    const fromEntity = Array.isArray(entity?.currencies) ? entity.currencies : [];
    const currencies = fromRoot.length > 0 ? fromRoot : fromEntity;

    return {
      ...raw,
      merchants,
      merchantInfo,
      canGenerateMultiQR: !!(raw.canGenerateMultiQR ?? raw.canGenerateMulti),
      canGenerateQR: !!(raw.canGenerateQR ?? raw.canGenerateQr ?? raw.showQr),
      canChangeComment: this.normalizeFlag(raw.canChangeComment),
      canReverse: this.normalizeFlag(raw.canReverse),
      canRefund: this.normalizeFlag(raw.canRefund),
      merchantUserId: String(raw.merchantUserId ?? raw.id ?? ''),
      currencies,
    } as MerchantUserClientView;
  }

  getMerchantUser(id: string | number | null | undefined | unknown): Observable<MerchantUserClientView> {
    const queryId = id == null || id === '' ? '' : String(id);
    return this.http
      .get<any>(`api/v1/MerchantUsers/GetMerchantUser?id=${encodeURIComponent(queryId)}`)
      .pipe(map((body) => this.normalizeMerchantUser(this.unwrapApiPayload(body))));
  }

  /**
   * Merchant-user transactions page (same contract as UniHostX).
   * Auth scopes the merchant; request body has no merchant `id`.
   * Response maps new `transactionsList` shape onto legacy `transactions`.
   */
  getTransactions(status: any, page: any, data: { start: string; end: string }, count: any = 50) {
    const body = {
      page,
      count,
      status,
      start: data?.start,
      end: data?.end,
    };
    return this.http
      .post<any>(`/api/Payment/GetTransactionsByPageMerchantUser`, body, {
        observe: 'response',
      })
      .pipe(
        map((res: HttpResponse<any>) => {
          const normalized = this.normalizeGetTransactionsPageBody(res.body);
          return res.clone({ body: normalized });
        })
      );
  }

  /** Unwrap ApiResult / nested `data` envelopes. */
  private unwrapApiPayload(raw: any): any {
    if (!raw || typeof raw !== 'object') {
      return raw;
    }
    if (raw.data != null && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
      const inner = raw.data;
      if (
        inner.transactionsList != null ||
        inner.transactions != null ||
        inner.items != null ||
        inner.merchantUserId != null ||
        inner.merchantEntity != null ||
        inner.merchants != null
      ) {
        return inner;
      }
    }
    return raw;
  }

  /**
   * New API: `transactionsList`, top-level `count`.
   * UI still expects `transactions`, nested `card.maskedPan`, `transactionId`, etc.
   */
  private normalizeGetTransactionsPageBody(raw: any): any {
    const payload = this.unwrapApiPayload(raw);
    if (!payload || typeof payload !== 'object') {
      return { transactions: [], tin: '', addressEn: '', count: 0 };
    }
    const sourceList =
      payload.transactionsList ??
      payload.transactions ??
      payload.items ??
      payload.TransactionsList ??
      payload.Transactions;
    const list = Array.isArray(sourceList) ? sourceList : [];
    const transactions = list.map((row) => this.normalizeUserTransactionRow(row));
    const count =
      payload.count != null && !Number.isNaN(Number(payload.count))
        ? Number(payload.count)
        : payload.totalCount != null && !Number.isNaN(Number(payload.totalCount))
        ? Number(payload.totalCount)
        : transactions.length;
    return {
      ...payload,
      transactions,
      count,
      tin: payload.tin ?? '',
      addressEn: payload.addressEn ?? '',
    };
  }

  private normalizeUserTransactionRow(raw: any): any {
    if (!raw || typeof raw !== 'object') {
      return raw;
    }
    const pan = String(raw.cardNumber ?? raw.card?.maskedPan ?? raw.card?.cardNumber ?? ' ').trim();
    const maskedPan = pan.length > 0 ? pan : ' ';
    const holder = String(
      raw.cardFullname ?? raw.card?.cardHolderName ?? raw.card?.cardFullname ?? ' '
    ).trim();

    const createDate =
      raw.createDate ?? raw.createdAt ?? raw.creationDate ?? raw.CreateDate ?? null;
    const transactionDate =
      raw.transactionDate ??
      raw.paymentDate ??
      raw.paidDate ??
      raw.TransactionDate ??
      createDate;

    const statusRaw = raw.transactionStatus ?? raw.status ?? raw.TransactionStatus;
    const transactionStatus = this.normalizeTransactionStatus(statusRaw);

    return {
      ...raw,
      transactionId: Number(raw.transactionId ?? raw.id ?? raw.transferId ?? 0),
      createDate,
      transactionDate,
      transactionStatus,
      merchantUsername: raw.merchantUsername ?? raw.bankTid ?? raw.userName ?? ' ',
      merchantName: raw.merchantName ?? raw.merchant ?? raw.companyNameEn ?? '',
      arcaOrderId: raw.arcaOrderId ?? raw.orderId ?? '',
      hashOrderId: raw.hashOrderId ?? raw.transactionHash ?? raw.hash ?? '',
      amount: Number(raw.amount ?? 0),
      authCode: raw.authCode ?? raw.rrn ?? '',
      appName: raw.appName ?? raw.applicationName ?? '',
      comment: raw.comment ?? '',
      currency: raw.currency ?? 'AMD',
      isLink: raw.isLink ?? 0,
      isBlocked: this.normalizeFlag(raw.isBlocked),
      isMulti: this.normalizeFlag(raw.isMulti),
      refundedAmount: Number(raw.refundedAmount ?? 0),
      refundedHistory: Array.isArray(raw.refundedHistory)
        ? raw.refundedHistory
        : [],
      receiver: this.stripDecorativeQuotes(raw.receiver),
      card: {
        maskedPan,
        expiryDate: raw.card?.expiryDate ?? 0,
        cardHolderName: holder.length > 0 ? holder : ' ',
      },
      canChangeComment: this.normalizeFlag(raw.canChangeComment ?? raw.canChange),
    };
  }

  private normalizeTransactionStatus(status: number | string | undefined | null): number {
    if (status == null || status === '') {
      return 0;
    }
    if (typeof status === 'number' && !Number.isNaN(status)) {
      return status;
    }
    const asNum = Number(status);
    if (!Number.isNaN(asNum) && String(status).trim() !== '') {
      return asNum;
    }
    const map: Record<string, number> = {
      Unpaid: 0,
      Created: 0,
      Pending: 1,
      Paid: 2,
      Reversed: 3,
      Reverse: 3,
      Refunded: 4,
      Refund: 4,
    };
    return map[String(status)] ?? 0;
  }

  private stripDecorativeQuotes(val: unknown): string {
    if (val == null) {
      return '';
    }
    let s = String(val).trim();
    if (
      (s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith("'") && s.endsWith("'"))
    ) {
      s = s.slice(1, -1).trim();
    }
    return s;
  }
  getTransactionsByMerchantUser(merchantId: number){
    return this.http.get(`/api/Payment/GetTransactionsByMerchantUser?id=${merchantId}`)
  }
  getTransactionsOnlyPaid(trId){
    return this.http.get(`/api/Payment/GetTransactionsOnlyPaid?id=${trId}`)
  }
  getTransactionsNotPaid(trId){
    return this.http.get(`/api/Payment/GetTransactionsNotPaid?id=${trId}`)
  }
  getTransactionsReversed(trId){
    return this.http.get(`/api/Payment/GetTransactionsReversed?id=${trId}`)
  }
}

/** Response from `GET /api/payment/gettransactionbytransactionhash` */
export interface GetTransactionByHashResponse {
  logo?: string;
  canChangeComment?: boolean;
  amount?: number;
  comment?: string;
  transferId?: number;
  currency?: string;
  language?: string;
  status?: number;
  merchantUserId?: string;
  isBlocked?: boolean;
  isMulti?: boolean;
  merchantName?: string;
  /** Merchant is on EPG: Apple Pay / Google Pay is available. */
  isEpg?: boolean;
}

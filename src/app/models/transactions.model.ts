export class Transactions {
  id?: number;
  transactionId: number;
  createDate: Date;
  transactionDate: Date;
  transactionType: number;
  merchantId: number;
  amount: number;
  authCode: string;
  bankTid: string;
  bankName: string;
  bankFee: number;
  payxFee: number;
  transactionOutOrLocal: number;
  card: Card;
  arcaOrderId: string;
  comment: string;
  appName?: any;
  domain?: any;
  mcc: string;
  isMulti: boolean;
  transactionStatus: number;
  merchantName: string;
  merchantUsername: string;
  hashOrderId: string;
  language: string;
  isBlocked: boolean;
  canChangeComment: boolean;
  qr: string;
  currency?: string;
  isLink?: number;
  receiver?: string;
  refundedAmount?: number;
  refundedHistory?: { date: string; refundedAmount: number }[];
}

export class Card {
  maskedPan: string;
  expiryDate: number;
  cardHolderName: string;
  bindingId?: any;
  color?: any;
  name?: any;
}

export class ResponseScannedQr {
  merchant: {
    merchantId: number;
    phone: string;
    website: string;
    companyName: string;
  };
  amount: number;
  transferId: number;
  transactionId: number;
  isMulti: boolean;
  comment: string;
  cardId: number;
  hash?: string;
  response?: any;
}

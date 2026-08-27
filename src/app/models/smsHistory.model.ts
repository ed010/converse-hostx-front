export class SMSHistory {
  id: number;
  merchantId: number;
  merchantName: string;
  merchantUser: string;
  receiver: string;
  transactionId: number;
  amount: number;
  sendDate: Date | string;
}

export interface SmsHistoryPage {
  items: SMSHistory[];
  count: number;
}

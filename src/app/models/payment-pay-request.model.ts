/** Body for `POST /api/payment/pay` */
export interface PaymentPayRequest {
  amount: number;
  transferId: number;
  comment: string;
  /** Receipt address; omitted when the payer did not ask for a receipt. */
  recipientEmail?: string;
}

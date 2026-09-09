/** Body for `POST /api/payment/pay` */
export interface PaymentPayRequest {
  amount: number;
  transferId: number;
  comment: string;
}

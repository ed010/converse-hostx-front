/** Body for `POST /api/payment/pay` */
export interface PaymentPayRequest {
  amount: number;
  transferId: number;
  comment: string;
  /** Apple Pay / Google Pay through EPG's hosted page (`_token` login). EPG merchants only. */
  isWallet?: boolean;
}

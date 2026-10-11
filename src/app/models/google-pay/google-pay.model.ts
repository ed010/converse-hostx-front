/** GET /api/Payment/GooglePayConfig: what the page needs to show the Google Pay button for one transaction. */
export interface GooglePayConfig {
  available: boolean;
  environment: "TEST" | "PRODUCTION";
  merchantId: string;
  merchantName: string;
  gateway: string;
  gatewayMerchantId: string;
  allowedCardNetworks: string[];
  allowedAuthMethods: string[];
  countryCode: string;
  currencyCode: string;
  totalPrice: string;
}

/** POST /api/Payment/ProcessGooglePayTransaction body. */
export interface ProcessGooglePay {
  transactionHash: string;
  /** Google's paymentMethodData.tokenizationData.token, unmodified. */
  paymentToken: string;
}

/**
 * Success: paid. Redirect: 3-D Secure required, send the payer to redirectUrl (EPG's ACS page).
 * Failed: declined; redirectUrl is the transaction's ReturnUrl (may be empty).
 */
export interface ProcessGooglePayResponse {
  status: "Success" | "Redirect" | "Failed";
  redirectUrl?: string;
  hashOrderId?: string;
  message?: string;
}

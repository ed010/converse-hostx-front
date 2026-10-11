// Minimal typings for the parts of the Google Pay web API (pay.js) this app uses.
// Reference: https://developers.google.com/pay/api/web/reference/client

declare namespace google.payments.api {
  type Environment = "TEST" | "PRODUCTION";
  type TransactionState = "SUCCESS" | "ERROR";

  interface PaymentMethod {
    type: "CARD";
    parameters: {
      allowedAuthMethods: string[];
      allowedCardNetworks: string[];
    };
    tokenizationSpecification?: {
      type: "PAYMENT_GATEWAY";
      parameters: { gateway: string; gatewayMerchantId: string };
    };
  }

  interface IsReadyToPayRequest {
    apiVersion: number;
    apiVersionMinor: number;
    allowedPaymentMethods: PaymentMethod[];
  }

  interface PaymentDataRequest extends IsReadyToPayRequest {
    merchantInfo: { merchantId?: string; merchantName: string };
    transactionInfo: {
      totalPriceStatus: "FINAL";
      totalPrice: string;
      currencyCode: string;
      countryCode: string;
    };
    callbackIntents?: "PAYMENT_AUTHORIZATION"[];
  }

  interface PaymentData {
    paymentMethodData: {
      tokenizationData: { type: string; token: string };
    };
  }

  interface PaymentAuthorizationResult {
    transactionState: TransactionState;
    error?: {
      intent: "PAYMENT_AUTHORIZATION";
      reason: "PAYMENT_DATA_INVALID" | "OTHER_ERROR";
      message: string;
    };
  }

  interface PaymentsClientOptions {
    environment: Environment;
    paymentDataCallbacks?: {
      onPaymentAuthorized: (
        paymentData: PaymentData
      ) => Promise<PaymentAuthorizationResult>;
    };
  }

  interface ButtonOptions {
    onClick: (event: Event) => void;
    allowedPaymentMethods?: PaymentMethod[];
    buttonColor?: "default" | "black" | "white";
    buttonType?: "book" | "buy" | "checkout" | "donate" | "order" | "pay" | "plain" | "subscribe";
    buttonSizeMode?: "static" | "fill";
    buttonLocale?: string;
  }

  class PaymentsClient {
    constructor(options: PaymentsClientOptions);
    isReadyToPay(request: IsReadyToPayRequest): Promise<{ result: boolean }>;
    createButton(options: ButtonOptions): HTMLElement;
    loadPaymentData(request: PaymentDataRequest): Promise<PaymentData>;
  }
}

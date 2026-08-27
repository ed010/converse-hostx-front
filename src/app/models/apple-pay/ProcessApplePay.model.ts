export interface ProcessApplePay {
  paymentData: {
    data: string;
    signature: string;
    header: {
      publicKeyHash: string;
      ephemeralPublicKey: string;
      transactionId: string;
    };
    version: string;
  };
  paymentMethod: {
    displayName: string;
    network: string;
    type: string;
  };
  transactionIdentifier: string;
}

export type RegisterApplePayModel = {
  encryptTo?: string;
  domainNames: string[];
  // API contract (same as legacy): the merchant id travels as partnerInternalMerchantIdentifier.
  partnerInternalMerchantIdentifier: string;
  partnerMerchantName: string;
}

/** Typical `POST /api/payment/pay` JSON body (success or business error). */
export interface PaymentPayResponse {
  orderId?: string | null;
  formUrl?: string | null;
  errorMessage?: string | null;
  errorCode?: number | null;
}

/** Returns API `errorMessage` when present, for success (200) or error HTTP bodies. */
export function readPayApiErrorMessage(source: unknown): string | null {
  if (source == null || typeof source !== "object") {
    return null;
  }
  const msg = (source as PaymentPayResponse).errorMessage;
  if (msg != null && String(msg).trim() !== "") {
    return String(msg).trim();
  }
  return null;
}

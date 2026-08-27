import { MerchantIdTitle } from "./merchantIdTitle";
import { MerchantInfo } from "./merchantInfo.model";

/**
 * Shape returned by {@link GetMerchantForUserService.getMerchantUser} after
 * normalizing API v1 payloads (single `merchantEntity` vs legacy `merchants[]`).
 */
export interface MerchantUserClientView {
  id?: string;
  username?: string;
  merchants: MerchantIdTitle[];
  /** Populated from root `merchantInfo` or `merchantEntity.merchantInfo` for templates */
  merchantInfo: MerchantInfo | null;
  canGenerateMultiQR: boolean;
  canGenerateQR: boolean;
  merchantUserId: string;
  canChangeComment: boolean;
  canReverse?: boolean;
  canRefund?: boolean;
  currencies: string[];
  merchantEntity?: unknown;
}

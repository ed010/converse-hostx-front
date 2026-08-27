/**
 * Backend always expects Armenian numbers as `374XXXXXXXX`:
 * "+37496030036" -> "37496030036", "096030036" -> "37496030036".
 */
export function normalizeArmenianPhoneNumber(raw: any): string {
  let phone = String(raw ?? "").replace(/\D/g, "");
  if (!phone) return "";
  if (phone.startsWith("00374")) {
    phone = phone.substring(2);
  }
  if (phone.startsWith("374")) {
    return phone;
  }
  phone = phone.replace(/^0+/, "");
  return "374" + phone;
}

export class MerchantUser {
  constructor() {
    this.merchantUserId = "";
    this.merchants = null;
    this.canReverse = false;
    this.canRefund = false;
    this.isGeneralUser = false;
    this.username = "";
    this.password = "";
    this.phoneNumber = "";
    this.isBlocked = false;
  }
  merchantUserId: string;
  /** Legacy list; API may return null and use merchantId / merchant / merchantEntity instead */
  merchants: Merchant[] | null;
  merchantId?: number;
  /** Numeric merchant FK from some API payloads */
  merchant?: number;
  merchantEntity?: {
    merchantId?: number;
    merchantInfo?: {
      companyNameEn?: string;
      companyNameHy?: string;
      companyNameRu?: string;
      addressEn?: string;
      addressHy?: string;
      tin?: string;
    };
  };
  merchantInfo?: {
    companyNameEn?: string;
    companyNameHy?: string;
    companyNameRu?: string;
    addressEn?: string;
    addressHy?: string;
    tin?: string;
  };
  canReverse: boolean;
  canRefund: boolean;
  isGeneralUser: boolean;
  username: string;
  password: string;
  phoneNumber: string;
  isBlocked: boolean;
  canGenerateMultiQR: boolean;
  canGenerateQR: boolean;
}

export type MerchantUserWriteMerchants =
  | null
  | { id: number; title: string }[];

/** Add: non-null `merchants` (current merchant). Update: `merchants` null per API. */
export interface MerchantUserWriteRequest {
  merchants: MerchantUserWriteMerchants;
  username: string;
  password: string;
  phoneNumber: string;
  canReverse: boolean;
  isGeneralUser: boolean;
  canGenerateMultiQR: boolean;
  canRefund: boolean;
  canGenerateQR: boolean;
}

export interface UpdateMerchantUserRequest extends MerchantUserWriteRequest {
  merchantUserId: string;
}

export class Merchant {
  constructor() {
    this.id = -1;
    this.title = "";
  }
  id: number;
  title: string;
}

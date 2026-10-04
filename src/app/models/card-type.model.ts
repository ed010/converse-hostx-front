export interface CardBinRange {
  id: number;
  cardTypeId: number;
  rangeStart: string;
  rangeEnd: string;
}

export interface CardType {
  id: number;
  code: string;
  name: string;
  logoUrl: string | null;
  sortOrder: number;
  /** The "unknown card" fallback row: cannot be deleted, takes no ranges, its code is fixed. */
  isDefault: boolean;
  ranges: CardBinRange[];
}

export interface CardTypeRequest {
  code?: string;
  name?: string;
  sortOrder?: number;
  /** Base64 image (data: URI accepted). Set only when a new logo was chosen. */
  logoBase64?: string;
  /** Existing logo URL echoed back on update. */
  logo?: string;
  ranges?: { rangeStart: string; rangeEnd: string }[];
}

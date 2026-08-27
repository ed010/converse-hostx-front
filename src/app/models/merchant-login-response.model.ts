export type LoginStatus = "OtpRequired" | "Authenticated";

/** Response body from POST `/api/Login/Login` */
export interface MerchantLoginResponse {
  status?: LoginStatus;
  pendingToken?: string | null;
  token: string | null;
  refreshToken: string | null;
  expiredate?: string | null;
  merchantUserId: string | null;
  merchantUser?: Record<string, unknown> | null;
}

/** Response body from POST `/api/Login/RefreshToken` */
export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiredate?: string;
}

export interface ApiResult<T> {
  success: boolean;
  data: T | null;
  errorCode?: string;
  errorMessage?: string;
  validationErrors?: unknown;
}

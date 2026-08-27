export interface ApplePayComponentResponse {
  status: "success" | "failure";
  redirect: boolean;
  redirect_url: string | null;
}

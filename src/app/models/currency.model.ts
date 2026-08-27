export interface Currency {
  name: string;
  code: string;
}

export interface CurrencyListResponse {
  items: Currency[];
  totalCount: number;
}

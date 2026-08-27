export interface LogsPage<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ArcaLog {
  id: number;
  createdAt: string;
  apiType: string;
  httpMethod: string;
  requestUrl: string;
  requestBody: string | null;
  responseStatusCode: number;
  responseBody: string | null;
  isSuccess: boolean;
  exceptionMessage: string | null;
  durationMs: number;
  correlationId: string;
  merchantId: number | null;
  transactionId: number | null;
  pxNumber: string | null;
  arcaOrderId: string | null;
  orderNumber: string | null;
}

export interface HostxLog {
  id: number;
  createdAt: string;
  httpMethod: string;
  path: string;
  queryString: string | null;
  action: string;
  requestBody: string | null;
  responseStatusCode: number;
  responseBody: string | null;
  isSuccess: boolean;
  exceptionMessage: string | null;
  durationMs: number;
  correlationId: string;
  clientIp: string | null;
  merchantId: number | null;
  transactionId: number | null;
  pxNumber: string | null;
  orderNumber: string | null;
}

export interface LogTrace {
  correlationId: string;
  inboundRequests: HostxLog[];
  arcaRequests: ArcaLog[];
}

export interface LogsFilter {
  merchantId?: number | string;
  transactionId?: number | string;
  pxNumber?: string;
  orderNumber?: string;
  arcaOrderId?: string;
  apiType?: string;
  action?: string;
  path?: string;
  correlationId?: string;
  from?: string;
  to?: string;
  isSuccess?: boolean | string;
  statusCode?: number | string;
  search?: string;
  page?: number;
  pageSize?: number;
}

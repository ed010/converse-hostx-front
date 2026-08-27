import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  ArcaLog,
  HostxLog,
  LogsFilter,
  LogsPage,
  LogTrace,
} from "../models/logs.model";

@Injectable({
  providedIn: "root",
})
export class LogsService {
  constructor(private http: HttpClient) {}

  getArcaLogs(filter: LogsFilter = {}): Observable<LogsPage<ArcaLog>> {
    return this.http.get<LogsPage<ArcaLog>>(`/api/Logs/arca`, {
      params: this.toParams(filter),
    });
  }

  getArcaLogById(id: number): Observable<ArcaLog> {
    return this.http.get<ArcaLog>(`/api/Logs/arca/${id}`);
  }

  getHostxLogs(filter: LogsFilter = {}): Observable<LogsPage<HostxLog>> {
    return this.http.get<LogsPage<HostxLog>>(`/api/Logs/hostx`, {
      params: this.toParams(filter),
    });
  }

  getHostxLogById(id: number): Observable<HostxLog> {
    return this.http.get<HostxLog>(`/api/Logs/hostx/${id}`);
  }

  getTrace(correlationId: string): Observable<LogTrace> {
    return this.http.get<LogTrace>(
      `/api/Logs/trace/${encodeURIComponent(correlationId)}`
    );
  }

  getTransactionHistory(params: {
    transactionId?: number | string;
    pxNumber?: string;
  }): Observable<LogTrace[]> {
    return this.http.get<LogTrace[]>(`/api/Logs/transaction`, {
      params: this.toParams(params),
    });
  }

  private toParams(filter: Record<string, any>): HttpParams {
    let params = new HttpParams();
    Object.keys(filter || {}).forEach((key) => {
      const value = filter[key];
      if (value === null || value === undefined || value === "") {
        return;
      }
      params = params.set(key, String(value));
    });
    return params;
  }
}

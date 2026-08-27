import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CurrencyListResponse } from '../models/currency.model';
import { Merchant } from '../models/merchant.model';
import { MerchantPercent } from '../models/merchantPercent.model';
import { MerchantArcaDetail } from '../models/merchantArcaDetail.model';
import { MerchantInfo } from '../models/merchantInfo.model';
import { DomainService } from './domain.service';

@Injectable({
  providedIn: 'root'
})
export class MerchantService {

  constructor(
    private http: HttpClient,
    private domainService: DomainService
  ) {}

  /**
   * Maps v1 `getmerchantbyid` JSON (e.g. `bpcTidBindingPass`, optional `isEpg`)
   * onto the {@link Merchant} shape used by admin merchant screens.
   */
  private normalizeMerchantByIdBody(raw: any): Merchant {
    if (raw == null || typeof raw !== 'object') {
      return raw as Merchant;
    }
    const arca =
      raw.merchantArcaDetails ??
      raw.merchantArcaDetail ??
      {};
    const merchantArcaDetails: MerchantArcaDetail = {
      id: arca.id ?? -1,
      tidBinding: arca.tidBinding ?? '',
      bpcTidBindingPassword:
        arca.bpcTidBindingPassword ?? arca.bpcTidBindingPass ?? '',
      tidApi: arca.tidApi ?? '',
      bpcTidApiPassword: arca.bpcTidApiPassword ?? arca.bpcTidApiPass ?? '',
      merchantGroupId:
        arca.merchantGroupId ?? raw.merchantGroup ?? 0,
      epgUsername: arca.epgUsername ?? '',
      epgPassword: arca.epgPassword ?? '',
    };

    const pct = raw.merchantPercent ?? {};
    const merchantPercent: MerchantPercent = {
      merchantArcaPercent: pct.merchantArcaPercent ?? 0,
      merchantLocalPercent: pct.merchantLocalPercent ?? 0,
      merchantOutPercent:
        pct.merchantOutPercent ??
        pct.merchantOutsidePercent ??
        0,
    };

    const merchantInfo = (raw.merchantInfo ?? {}) as MerchantInfo;

    return {
      ...raw,
      merchantInfo,
      merchantPercent,
      merchantArcaDetails,
      bank: raw.bank ?? ({ id: 0, title: '' } as any),
      domain: raw.domain ?? ({ id: 0, title: '' } as any),
      isEpg: !!(raw.isEpg ?? raw.isEPG),
      currencies: Array.isArray(raw.currencies) ? raw.currencies : [],
      canChangeComment: !!raw.canChangeComment,
      status: this.normalizeMerchantStatus(raw.status),
    } as Merchant;
  }

  private normalizeMerchantStatus(status: number | string | undefined): number {
    if (status == null) {
      return 0;
    }
    if (typeof status === 'number') {
      return status;
    }
    const map: Record<string, number> = {
      InProcess: 0,
      Active: 1,
      NotActive: 2,
      Closed: 2,
    };
    return map[status] ?? 0;
  }

  private merchantStatusToApiString(status: number): string {
    const map: Record<number, string> = {
      0: 'InProcess',
      1: 'Active',
      2: 'NotActive',
    };
    return map[status] ?? 'InProcess';
  }

  getMerchantById(id: number): Observable<HttpResponse<Merchant>> {
    return this.http
      .get<any>(`/api/v1/merchant/getmerchantbyid/${id}`, {
        observe: 'response',
      })
      .pipe(
        map((res: HttpResponse<any>) =>
          res.clone({
            body: this.normalizeMerchantByIdBody(res.body),
          })
        )
      );
  }

  updateMerchant(m:Merchant){
    return this.http.put(`/api/v1/Merchant/UpdateMerchant`,m,{observe:"body"})
  }
  cahngeMerchantStatus(id: number, status: number){
    const body = {
      merchantId: id,
      status: this.merchantStatusToApiString(status),
    };
    return this.http.put(`/api/v1/Merchant/ChangeStatus`, body, { observe: 'body' });
  }

  getMerchants(){
    return this.http.get(`/api/Merchant/GetMerchants`,{observe:"response"})
  }

  addMerchant(merchant:Merchant){
    return this.http.post(`/api/v1/Merchant/AddMerchant`,merchant,{observe:"response"})
  }

  deleteMerchant(id:number){
    const params=new HttpParams()
    .set("id",id.toString())
    return this.http.delete(`/api/Merchant/RemoveMerchant`,{params,observe:"response"})
  }

  deactivateMerchant(id: number) {
    return this.cahngeMerchantStatus(id, 2);
  }

  getMerchantsByPage(page:number, count: number){
    const params=new HttpParams()
    .set("page",page.toString())
    .set("count", count.toString())
    return this.http.get(`/api/Merchant/GetMerchantsByPage`,{params,observe:'response'})
  }

  getMerhcnatFiltersByPage(page:number, count: number, body:any){
    const params=new HttpParams()
    .set("page",page.toString())
    .set("count", count.toString())
    return this.http.post(`/api/v1/Merchant/SearchMerchants`,  body, {params,observe:'response'})
  }


  getFilteredByName(n:number){
    return this.http.get(`/api/Merchant/GetFilteredByName?orderingType=${n}`,{observe:"response"})
  }

  getHeaders(){
    return this.http.get(`/api/MerchantTable/GetHeaders`,{observe:'response'})
  }

  updateHeader(id:number){
    return this.http.put(`/api/MerchantTable/UpdateHeader?id=${id}`,{observe:"response"})
  }

  getSMS(){
    return this.http.get(`/api/v1/Merchant/GetSMSHistories`,{observe:"body"})
  }

  genratePayxToken()
  {
    return this.http.get(`/api/Merchant/GeneratePayxToken`, {observe: 'response'})
  }
  getDomains() {
    return this.domainService.getDomains();
  }

  endTMerchantsForExcel(body) {
    // const headers = new HttpHeaders().set('Content-Type', 'xlxx');
    return this.http.post(`/api/Merchant/GetMerchantsExcel`, body, {
      responseType: "blob",
    });
  }

  exportMerchantsForAdmin(page: number, count: number, body: Record<string, string | null>) {
    const params = new HttpParams()
      .set("page", page.toString())
      .set("count", count.toString());
    return this.http.post(`/api/v1/Merchant/ExportMerchantsForAdmin`, body, {
      params,
      responseType: "blob",
    });
  }

  getCurrencies(page: number = 1, count: number = 1000) {
    return this.http.post<CurrencyListResponse>(
      `/api/v1/merchant/currency?page=${page}&count=${count}`,
      {}
    );
  }
}

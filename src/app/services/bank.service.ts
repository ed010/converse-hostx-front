import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Bank } from '../models/bank.model';

@Injectable({
  providedIn: 'root'
})
export class BankService {

constructor(private http:HttpClient) { }

  getBanks(page: number = 1, count: number = 1000): Observable<Bank[]> {
    return this.http
      .post<{ items: Bank[]; totalCount?: number }>(
        `/api/Bank/GetBanks?page=${page}&count=${count}`,
        {}
      )
      .pipe(map((res) => res?.items ?? []));
  }

  addBank(bank:Bank){
    return this.http.post(`/api/Bank/AddBank`,bank,{observe:"response"})
  }

  updateBank(bank:Bank){
    return this.http.put(`/api/Bank/UpdateBank`,bank,{observe:"response"})
  }

  deleteBank(id:number){
    const params=new HttpParams()
    .set("id",id.toString());
    return this.http.delete(`/api/Bank/DeleteBank`,{params,observe:"response"})
  }
}

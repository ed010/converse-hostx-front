import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Domain, DomainListResponse } from '../models/domain.model';

@Injectable({
  providedIn: 'root'
})
export class DomainService {

  constructor(private http:HttpClient) { }

  getDomains(page: number = 1, count: number = 1000) {
    return this.http.post<DomainListResponse>(
      `/api/Domain/GetDomains?page=${page}&count=${count}`,
      {}
    );
  }

  addDomain(domain:Domain){
    return this.http.post(`/api/Domain/AddDomain`,domain,{observe:"response"})
  }

  updateDomain(domain: Pick<Domain, 'id' | 'title'>) {
    return this.http.put(
      `/api/Domain/UpdateDomain`,
      { id: domain.id, title: domain.title },
      { observe: 'response' }
    );
  }

  deleteDomain(id:number){
    const params=new HttpParams()
    .set("id",id.toString());
    return this.http.delete(`/api/Domain/DeleteDomain`,{params,observe:"response"})
  }
}

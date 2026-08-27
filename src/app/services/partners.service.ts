import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Partner } from '../models/partner';

@Injectable({
  providedIn: 'root'
})
export class PartnersService {

  constructor(
    private http: HttpClient
  ) { }

  getPartners()
  {
    return this.http.get(`/api/HostXSystem/GetSystems?page=${1}&count=${20}`, {observe: 'response'})
  }
  newPartner(body: Partner)
  {
    return this.http.post(`/api/HostXSystem/AddSystem`, body,{observe: 'response'})
  }
  updatePartner(body: Partner)
  {
    return this.http.put(`/api/HostXSystem/UpdateSystem`, body,{observe: 'response'})
  }
  deletePartner(qrType: string)
  {
    return this.http.delete(`/api/HostXSystem/RemoveSystem?qrType=${qrType}`, {observe: 'response'})
  }
}

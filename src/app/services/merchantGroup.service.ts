import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MerchantGroup } from '../models/merchantGroup.model';

@Injectable({
  providedIn: 'root'
})
export class MerchantGroupService {

constructor(private http:HttpClient) { }

  getGroups(){
    return this.http.get(`/api/MerchantGroup/GetMerchantGroups`,{observe:"response"})
  }

  addGroup(mg:MerchantGroup){
    return this.http.post(`/api/MerchantGroup/AddMerchantGroup`,mg,{observe:"response"})
  }

  deleteGroup(id:number){
    const params=new HttpParams()
    .set("id",id.toString())
    return this.http.delete(`/api/MerchantGroup/RemoveMerchantGroup`,{params,observe:"response"})
  }

  updateGroup(mg:MerchantGroup){
    return this.http.put(`/api/MerchantGroup/UpdateMerchantGroup`,mg,{observe:'response'})
  }

  getMerchantGroupsByBank(id:number){
    const params=new HttpParams()
    .set("id",id.toString())
    return this.http.get(`/api/MerchantGroup/GetMerchantGroupsByBank`,{params,observe:'response'})
  }

  getMerchantGroupsByName(id:number,q:string){
    const params=new HttpParams()
    .set("bankId",id.toString())
    .set('q',q.toString())
    return this.http.get(`/api/MerchantGroup/GetMerchantGroupsByName`,{params,observe:"response"})
  }

  extractFile(data:any){
    let body = data
    return this.http.post(`/api/Payment/GetExtractFile`, body, {responseType: "blob", observe: 'response'})
  }

}

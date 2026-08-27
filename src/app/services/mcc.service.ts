import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Mcc } from '../models/mcc.model';

@Injectable({
  providedIn: 'root'
})
export class MccService {

  constructor(private http:HttpClient) { }

  getMccs(){
    return this.http.get(`/api/Mcc/GetMccs`,{observe:"response"})
  }

  addMcc(mcc:Mcc){
    return this.http.post(`/api/Mcc/AddMcc`,mcc,{observe:"response"})
  }

  deleteMcc(id:number){
    const params=new HttpParams()
    .set("id",id.toString())
    return this.http.delete(`/api/Mcc/RemoveMcc`,{params,observe:"response"})
  }

  updateMcc(mcc:Mcc){
    return this.http.put(`/api/Mcc/UpdateMcc`,mcc,{observe:"response"})
  }

  searchByMccCode(code:string){
    const params=new HttpParams()
    .set("q",code.toString())
    return this.http.get(`/api/Mcc/SearchByMccCode`,{params,observe:"response"})
  }
}

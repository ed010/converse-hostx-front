import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebXService {

constructor(private http:HttpClient) { }

getTransaction(px:string){
  return this.http.get(`/api/Payment/GetTransactionByPxNumber?pxNumber=${px}`,{observe:"response"})
}

  payByCard(px: string, b: boolean, c: string) {
  var body={
    "pxNumber": px,
    "cardId": 0
  }
  return this.http.post(`/api/Payment/PayWebX?IsBind=${b}&client_id=${c}`,body,{observe:"body"})
}

payByUser(px:string,cardId){
  var body={
    "pxNumber": px,
    "cardId": cardId
  }
  return this.http.post(`/api/Payment/PayWebX`,body,{observe:"body"})
}

}

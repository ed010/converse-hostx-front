import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WebXService {

constructor(private http:HttpClient) { }

getTransaction(px:string){
  return this.http.get(`/api/Payment/GetTransactionByPxNumber?pxNumber=${px}`,{observe:"response"})
}

  /** Registers the ARCA order and returns the bank's hosted form URL. */
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

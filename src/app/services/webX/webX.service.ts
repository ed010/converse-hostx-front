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

  /**
   * Registers the ARCA order and returns the bank's hosted form URL.
   * `isWallet` = Apple Pay / Google Pay: the order is registered on the merchant's `_token` EPG
   * login and EPG's page shows the wallet itself. EPG merchants only; the API rejects it otherwise.
   */
  payByCard(px: string, b: boolean, c: string, isWallet: boolean = false) {
  var body={
    "pxNumber": px,
    "cardId": 0
  }
  return this.http.post(`/api/Payment/PayWebX?IsBind=${b}&client_id=${c}&isWallet=${isWallet}`,body,{observe:"body"})
}

payByUser(px:string,cardId){
  var body={
    "pxNumber": px,
    "cardId": cardId
  }
  return this.http.post(`/api/Payment/PayWebX`,body,{observe:"body"})
}

}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EposService {

constructor(private http: HttpClient) { }

  checkStatus(id)
  {
    return this.http.get(`api/payment/CheckStatus?id=${id}`)
  }
  refund(amount, id)
  {
    let body = null
    return this.http.post(`api/payment/Refund?amount=${amount}&transactionId=${id}`, {observe: 'response'})
  }

}

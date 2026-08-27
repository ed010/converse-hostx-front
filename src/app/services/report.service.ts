import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

constructor(private http: HttpClient) { }

  getHistory()
  {
    return this.http.get('/api/Payment/GetPatches', {observe: 'response'})
  }

  extractFile(data:any){
    let body = data
    return this.http.post(`/api/Payment/GetExtractFile`, body, {responseType: "blob", observe: 'response'})
  }

}

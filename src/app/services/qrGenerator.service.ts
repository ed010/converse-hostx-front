import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Qr } from '../models/qr';
import { getStoredLanguageCode, normalizeLanguageCode } from '../utils/language.util';

@Injectable({
  providedIn: 'root'
})
export class QrGeneratorService {

constructor(private http: HttpClient) { }

  getQr(body: Qr, lang?: string | null){
    const normalizedLang = normalizeLanguageCode(lang, getStoredLanguageCode());
    const headers = new HttpHeaders().set('lang', normalizedLang)
    return this.http.post(`/api/Qr/GenerateQR`, body, {headers: headers, observe:"response"})
  }
  scanQr(qr: string)
  {
    let body = {
      qr: qr
    }
    return this.http.post(`/api/Qr/ScanQr`, body, {observe: "response"})
  }

}

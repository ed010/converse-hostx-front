import { Injectable } from "@angular/core";
import { Observable, of, Subject } from "rxjs";
import { MerchantIdTitle } from "../models/merchantIdTitle";

@Injectable({
  providedIn: "root",
})
export class DataExchangeService {
  private merchents: MerchantIdTitle[];
  private newMerId = new Subject<number>();

  private notification = new Subject<string>();

  private languageForTransaction$ = new Subject<string>();

  private merchantTransactions = new Subject<MerchantIdTitle>();

  id;
  constructor() {}

  updateObj(someData) {
    // console.log(someData);
    // this.merchents.next(someData)
    this.merchents = someData;
    // let text = this.merchents.map((a) => a.id).toString()
    // localStorage.setItem('aa', text)
  }

  getObj() {
    // return this.merchents.asObservable()
    return this.merchents;
  }
  setMerId(id) {
    this.id = id;
    this.newMerId.next(id);
  }
  retId() {
    return this.id;
  }
  getMerId() {
    return this.newMerId.asObservable();
  }

  updateMerchantTr(data) {
    // console.log(data)
    this.merchantTransactions.next(data);
  }
  getMerchantTr() {
    return this.merchantTransactions.asObservable();
  }

  updateNotification(data) {
    this.notification.next(data);
  }
  getNotification() {
    return this.notification.asObservable();
  }

  setLanguage(lang) {
    this.languageForTransaction$.next(lang);
  }
  getLanguage() {
    return this.languageForTransaction$.asObservable();
  }
}

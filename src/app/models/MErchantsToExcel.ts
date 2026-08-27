import { Merchant } from "./merchantUser.model";

export class MerchantsToExcel {
  keys: Map<string, Object>;
  merchants: Merchant[];
  constructor(){
    this.keys = new Map
    this.merchants = []
  }
}


import { Bank } from "./bank.model";
import { Domain } from "./domain.model";
import { MerchantArcaDetail } from "./merchantArcaDetail.model";

export class MerchantGroup{
  id:number;
  bank:Bank;
  mcc:string;
  bankPercent:number;
  merchantGroupName: string;
  merchantArcaDetails: MerchantArcaDetail;
}

export class MerchantGroupWithBank{
  constructor(){
    this.bank=new Bank;
    this.groups=[];
  }
  bank:Bank;
  groups:MerchantGroup[];
}

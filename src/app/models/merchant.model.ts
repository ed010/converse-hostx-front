import { MerchantPercent } from "./merchantPercent.model";
import { MerchantArcaDetail } from "./merchantArcaDetail.model";
import { Domain } from "./domain.model";
import { Bank } from "./bank.model";
import { MerchantInfo } from "./merchantInfo.model";

export class Merchant {
  merchantId: number;
  payxToken: string;
  merchantInfo: MerchantInfo;
  bank: Bank;
  domain: Domain;
  mcc: string;
  merchantPercent: MerchantPercent;
  merchantGroup: number;
  merchantArcaDetails: MerchantArcaDetail;
  feeType: number;
  merchantType: number;
  isOffline: boolean;
  bankInternalTid: string;
  bankInternalMid: string;
  status: number;
  sphereOfActivity: string;
  canChangeComment: boolean;
  isEpg: boolean;
  currencies?: string[];
}

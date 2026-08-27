import { Domain } from './domain.model';
import { MccBankTariffs } from './mccBankTariffs.model';

export class Mcc{
  id: number;
  mccCode:string;
  activityType:string;
  domain:Domain;
  mccBankTarifs:MccBankTariffs[];
}


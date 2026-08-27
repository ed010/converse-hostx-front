export class Transactionfilter {
  keys:{
    'transactions.id': string,
    'amount': string,
    'merchant_id': string,
    'company_name_en': string,
    'auth_code': string,
    'bank_tid': string,
    'bank_name': string,
    'payx_fee': string,
    'card_number': string,
    'comment': string,
    'app_name': string,
    'mcc': string
  };
  creationDateStart: string;
  creationDateEnd: string;
  paymentDateStart: string;
  paymentDateEnd: string;

  // constructor(){
  //   this.keys["transactions.id"] = ''
  //   this.keys.amount = ''
  //   this.keys.merchant_id = ''
  //   this.keys.company_name_en = ''
  //   this.keys.auth_code = ''
  //   this.keys.bank_tid = ''
  //   this.keys.bank_name = ''
  //   this.keys.payx_fee = ''
  //   this.keys.card_number = ''
  //   this.keys.comment = ''
  //   this.keys.app_name = ''
  //   this.keys.mcc = ''
  //   this.creationDateStart = ''
  //   this.creationDateEnd = ''
  //   this.paymentDateEnd = ''
  //   this.paymentDateStart = ''
  // }
}

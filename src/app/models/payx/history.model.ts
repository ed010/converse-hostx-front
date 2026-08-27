export class History{
  amount: number
  comment: string
  date: Date
  tranasctionId: number
  merchantInfo:MerchantInfo
}
export class MerchantInfo{
  address: string
  bankSerialNumber: string
  companyName: string
  director: string
  email: string
  legalAddress: string
  legalCompanyName: string
  logo: string
  phone: string
  smsPhone: string
  tin: string
  website: string
}

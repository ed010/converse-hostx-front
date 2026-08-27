import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Header } from 'src/app/models/header.model';
import { Merchant } from 'src/app/models/merchantUser.model';
import { MerchantService } from 'src/app/services/merchant.service';
import data from "src/assets/jsons/staticData.json";


@Component({
  selector: 'app-merchants',
  templateUrl: './merchants.component.html',
  styleUrls: ['./merchants.component.scss']
})
export class MerchantsComponent implements OnInit, OnDestroy {

  headers: Header[] = [];
  merchants: Merchant[] = [];
  dataArray: any[] = [];
  d = data;
  page: number = 1;
  pageSize: number = 30;
  exportCount: number = 1000;
  status :string = '1';


  downloadExcelLoader: boolean = false



  showLoader: boolean = false;
  disableNextPage: boolean = false

  @ViewChild('closeModal') closeModal: ElementRef
  @ViewChild('closeFilters') closeFilters: ElementRef
  @ViewChild('closeAddMerchant') closeAddMerchant: ElementRef
  @ViewChild('tableSettings') tableSettings: ElementRef


  filterSearch = {
    'status': '',
    'merchant_id': '',
    'director' : '',
    'legal_company_name': '',
    'legal_address': '',
    'bank_serial_number': '',
    'website': '',
    'email': '',
    'sms_phone': '',
    'phone': '',
    'tin': '',
    'company_name_hy': '',
    'company_name_en': '',
    'company_name_ru': '',
    'address_hy': '',
    'address_en': '',
    'mcc': '',


    'tid_api': '',
    'tid_api_pass': '',
    'tid_binding': '',
    'tid_binding_pass': '',
    'merchant_arca_percent': '',
    'merchant_local_percent': '',
    'merchant_outside_percent': '',
    'fee_type': '',
    'title': '',
    'offline_merhcant': '',
    'merchant_type': '',
    'bank_internal_tid': '',
    'bank_internal_mid': '',
  }

  columnsState = {
    status: true,
    merchant_id: true,
    director: true,
    legal_company_name: true,
    legal_address: true,
    bank_serial_number: true,
    website: true,
    email: true,
    sms_phone: true,
    phone: true,
    tin: true,
    company_name_hy: true,
    company_name_en: true,
    company_name_ru: true,
    address_hy: true,
    address_en: true,
    mcc: true,
    tid_api: true,
    tid_api_pass: true,
    tid_binding: true,
    tid_binding_pass: true,
    merchant_arca_percent: true,
    merchant_local_percent: true,
    merchant_outside_percent: true,
    fee_type: true,
    title: true,
    offline_merhcant: true,
    merchant_type: true,
    bank_internal_tid: true,
    bank_internal_mid: true,
  }


  constructor(
    private merchantService: MerchantService,
    private route: ActivatedRoute,
    private router: Router,
    private _snackBar: MatSnackBar

  ) { }

  ngOnInit(): void {
    // this.getHeaders();
    // for (let key in this.d) {
    //   this.dataArray.push(this.d[key]);
    // }
    this.getLocalStorageFields()
    this.route.queryParams
    .subscribe(res =>
      {

        this.filterSearch.status, this.status = res['status'] == undefined ? '1': res['status']
        this.filterSearch.director = res['director'] != undefined ? res['director'] : ''
        this.filterSearch.merchant_id = res['merchant_id'] != undefined ? res['merchant_id'] : ''
        this.filterSearch.legal_company_name = res['legal_company_name'] != undefined ? res['legal_company_name'] : ''
        this.filterSearch.legal_address = res['legal_address'] != undefined ? res['legal_address'] : ''
        this.filterSearch.bank_serial_number = res['bank_serial_number'] != undefined ? res['bank_serial_number'] : ''
        this.filterSearch.website = res['website'] != undefined ? res['website'] : ''
        this.filterSearch.email = res['email'] != undefined ? res['email'] : ''
        this.filterSearch.sms_phone = res['sms_phone'] != undefined ? res['sms_phone'] : ''
        this.filterSearch.phone = res['phone'] != undefined ? res['phone'] : ''
        this.filterSearch.tin = res['tin'] != undefined ? res['tin'] : ''
        this.filterSearch.company_name_hy = res['company_name_hy'] != undefined ? res['company_name_hy'] : ''
        this.filterSearch.company_name_en = res['company_name_en'] != undefined ? res['company_name_en'] : ''
        this.filterSearch.company_name_ru = res['company_name_ru'] != undefined ? res['company_name_ru'] : ''
        this.filterSearch.address_hy = res['address_hy'] != undefined ? res['address_hy'] : ''
        this.filterSearch.address_en = res['address_en'] != undefined ? res['address_en'] : ''
        this.filterSearch.mcc = res['mcc'] != undefined ? res['mcc'] : ''
        this.filterSearch.address_en = res['tid_api'] != undefined ? res['tid_api'] : ''
        this.filterSearch.address_en = res['tid_api_pass'] != undefined ? res['tid_api_pass'] : ''
        this.filterSearch.address_en = res['tid_binding'] != undefined ? res['tid_binding'] : ''
        this.filterSearch.address_en = res['tid_binding_pass'] != undefined ? res['tid_binding_pass'] : ''
        this.filterSearch.address_en = res['merchant_arca_percent'] != undefined ? res['merchant_arca_percent'] : ''
        this.filterSearch.address_en = res['merchant_local_percent'] != undefined ? res['merchant_local_percent'] : ''
        this.filterSearch.address_en = res['merchant_outside_percent'] != undefined ? res['merchant_outside_percent'] : ''
        this.filterSearch.address_en = res['fee_type'] != undefined ? res['fee_type'] : ''
        this.filterSearch.address_en = res['title'] != undefined ? res['title'] : ''
        this.filterSearch.address_en = res['offline_merhcant'] != undefined ? res['offline_merhcant'] : ''
        this.filterSearch.address_en = res['merchant_type'] != undefined ? res['merchant_type'] : ''
        this.filterSearch.address_en = res['bank_internal_tid'] != undefined ? res['bank_internal_tid'] : ''
        this.filterSearch.address_en = res['bank_internal_mid'] != undefined ? res['bank_internal_mid'] : ''

        if(res['page']*1 <= 0 || !Number.isInteger(res['page']*1) ||  res['page'] == undefined)
          this.page = 1
        else
          this.page = res['page']*1



        this.getMerchants(this.page, this.filterSearch);
      })
  }

  filter()
  {
    let queryParams = {}

    for (let i in this.filterSearch){
      if(this.filterSearch[i] != '')
      {
        queryParams[`${i}`] = this.filterSearch[i]
      }
      else
      {
        queryParams[`${i}`]=''
      }
    }
    this.router.navigate([],{
      queryParamsHandling: 'merge',
      relativeTo: this.route,
      queryParams: queryParams
    })
    console.log(queryParams)
    this.closeModal.nativeElement.click()
  }


  goToPage(val)
  {
    if (this.page == 1 && val == -1)
    return
    this.page *= 1
    this.page += val*1
    const queryParams: Params = { page: `${this.page}` };
    this.router.navigate([],{
      queryParamsHandling: 'merge',
      relativeTo: this.route,
      queryParams: queryParams,
    })
  }

  filterByStatus()
  {
    let queryParams = {}

    for (let i in this.filterSearch){
      if(this.filterSearch[i] != '')
      {
        queryParams[`${i}`] = this.filterSearch[i]
      }
      else
      {
        queryParams[`${i}`]=''
      }
    }
    this.router.navigate([],{
      queryParamsHandling: 'merge',
      relativeTo: this.route,
      queryParams: queryParams
    })
  }

  getHeaders() {
    this.merchantService.getHeaders().subscribe((res) => {
      this.headers = res.body as Header[];
    },
    err=>{
      let errmer = err?.error?.message
        this._snackBar.open(errmer,'', {
          duration: 7000
        });
    });
  }

  getMerchants(page, filters, count = this.pageSize)
  {
    this.showLoader = true
    this.merchantService.getMerhcnatFiltersByPage(page, count, filters).subscribe(
      res =>
      {
        this.merchants = res.body as Merchant[]
        if (this.merchants.length != count)
          this.disableNextPage = true
        this.showLoader = false;
      },
      err => {
        this.showLoader = false
        let errmer = err?.error?.message
        this._snackBar.open(errmer,'', {
          duration: 7000
        });
      }

    )

  }

  updateHeader(index: number) {
    let id = index + 1;
    this.merchantService.updateHeader(id).subscribe((res) => {
      this.getHeaders()
    },
    err=>{
      let errmer = err?.error?.message
        this._snackBar.open(errmer,'', {
          duration: 7000
        });
    });
  }

  openMerchantInfo(id:number) {
    this.router.navigateByUrl("admin/merchants/merchant-info?id=" + id);
  }


  private toNullableFilter(value: string): string | null {
    return value === "" || value == null ? null : value;
  }

  private buildExportSearchBody() {
    return {
      addressEn: this.toNullableFilter(this.filterSearch.address_en),
      addressHy: this.toNullableFilter(this.filterSearch.address_hy),
      bankInternalMid: this.toNullableFilter(this.filterSearch.bank_internal_mid),
      bankInternalTid: this.toNullableFilter(this.filterSearch.bank_internal_tid),
      bankSerialNumber: this.toNullableFilter(this.filterSearch.bank_serial_number),
      companyNameEn: this.toNullableFilter(this.filterSearch.company_name_en),
      companyNameHy: this.toNullableFilter(this.filterSearch.company_name_hy),
      companyNameRu: this.toNullableFilter(this.filterSearch.company_name_ru),
      director: this.toNullableFilter(this.filterSearch.director),
      email: this.toNullableFilter(this.filterSearch.email),
      feeType: this.toNullableFilter(this.filterSearch.fee_type),
      legalAddress: this.toNullableFilter(this.filterSearch.legal_address),
      legalCompanyName: this.toNullableFilter(this.filterSearch.legal_company_name),
      mcc: this.toNullableFilter(this.filterSearch.mcc),
      merchantArcaPercent: this.toNullableFilter(this.filterSearch.merchant_arca_percent),
      merchantId: this.toNullableFilter(this.filterSearch.merchant_id),
      merchantLocalPercent: this.toNullableFilter(this.filterSearch.merchant_local_percent),
      merchantOutsidePercent: this.toNullableFilter(this.filterSearch.merchant_outside_percent),
      merchantType: this.toNullableFilter(this.filterSearch.merchant_type),
      offlineMerhcant: this.toNullableFilter(this.filterSearch.offline_merhcant),
      phone: this.toNullableFilter(this.filterSearch.phone),
      smsPhone: this.toNullableFilter(this.filterSearch.sms_phone),
      status: this.toNullableFilter(this.filterSearch.status),
      tidApi: this.toNullableFilter(this.filterSearch.tid_api),
      tidApiPass: this.toNullableFilter(this.filterSearch.tid_api_pass),
      tidBinding: this.toNullableFilter(this.filterSearch.tid_binding),
      tidBindingPass: this.toNullableFilter(this.filterSearch.tid_binding_pass),
      tin: this.toNullableFilter(this.filterSearch.tin),
      title: this.toNullableFilter(this.filterSearch.title),
      website: this.toNullableFilter(this.filterSearch.website),
    };
  }

  createExcelModel() {
    this.downloadExcelLoader = true;

    const page = this.page > 0 ? this.page : 1;
    const body = this.buildExportSearchBody();

    this.merchantService.exportMerchantsForAdmin(page, this.exportCount, body).subscribe(
      (res) => {
        const currentDate = new Date();
        const dformat =
          [
            currentDate.getMonth() + 1,
            currentDate.getDate(),
            currentDate.getFullYear(),
          ].join("/") +
          " " +
          [
            currentDate.getHours(),
            currentDate.getMinutes(),
            currentDate.getSeconds(),
          ].join(":");
        const blob = new Blob([res], { type: "application/octet-stream" });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.download = `Merchants-${dformat}.xlsx`;
        anchor.href = url;
        anchor.click();
        window.URL.revokeObjectURL(url);
        this.downloadExcelLoader = false;
      },
      (err) => {
        this.downloadExcelLoader = false;
        const errmer = err?.error?.message || err?.error?.errorMessage;
        this._snackBar.open(errmer, "", {
          duration: 7000,
        });
      }
    );
  }

  getLocalStorageFields()
  {
    if(localStorage.getItem('fields'))
    {
    let base64 = atob(localStorage.getItem('merchant_columns'))
    let l_str = JSON.parse(base64)

    this.columnsState.status = l_str.status
    this.columnsState.merchant_id = l_str.merchant_id
    this.columnsState.director = l_str.director
    this.columnsState.legal_company_name = l_str.legal_company_name
    this.columnsState.legal_address = l_str.legal_address
    this.columnsState.bank_serial_number = l_str.bank_serial_number
    this.columnsState.website = l_str.website
    this.columnsState.email = l_str.email
    this.columnsState.sms_phone = l_str.sms_phone
    this.columnsState.phone = l_str.phone
    this.columnsState.tin = l_str.tin
    this.columnsState.company_name_hy = l_str.company_name_hy
    this.columnsState.company_name_en = l_str.company_name_en
    this.columnsState.company_name_ru = l_str.company_name_ru
    this.columnsState.address_hy = l_str.address_hy
    this.columnsState.address_en = l_str.address_en
    this.columnsState.mcc = l_str.mcc
    this.columnsState.tid_api = l_str.tid_api
    this.columnsState.tid_api_pass = l_str.tid_api_pass
    this.columnsState.tid_binding = l_str.tid_binding
    this.columnsState.tid_binding_pass = l_str.tid_binding_pass
    this.columnsState.merchant_arca_percent = l_str.merchant_arca_percent
    this.columnsState.merchant_local_percent = l_str.merchant_local_percent
    this.columnsState.merchant_outside_percent = l_str.merchant_outside_percent
    this.columnsState.fee_type = l_str.fee_type
    this.columnsState.title = l_str.title
    this.columnsState.offline_merhcant = l_str.offline_merhcant
    this.columnsState.merchant_type = l_str.merchant_type
    this.columnsState.bank_internal_tid = l_str.bank_internal_tid
    this.columnsState.bank_internal_mid = l_str.bank_internal_mid
    }
    else return
  }

  changeColumn(){
    let locobj = {
      status: this.columnsState.status,
      merchant_id: this.columnsState.merchant_id,
      director: this.columnsState.director,
      legal_company_name: this.columnsState.legal_company_name,
      legal_address: this.columnsState.legal_address,
      bank_serial_number: this.columnsState.bank_serial_number,
      website: this.columnsState.website,
      email: this.columnsState.email,
      sms_phone: this.columnsState.sms_phone,
      phone: this.columnsState.phone,
      tin: this.columnsState.tin,
      company_name_hy: this.columnsState.company_name_hy,
      company_name_en: this.columnsState.company_name_en,
      company_name_ru: this.columnsState.company_name_ru,
      address_hy: this.columnsState.address_hy,
      address_en: this.columnsState.address_en,
      mcc: this.columnsState.mcc,
      tid_api: this.columnsState.tid_api,
      tid_api_pass: this.columnsState.tid_api_pass,
      tid_binding: this.columnsState.tid_binding,
      tid_binding_pass: this.columnsState.tid_binding_pass,
      merchant_arca_percent: this.columnsState.merchant_arca_percent,
      merchant_local_percent: this.columnsState.merchant_local_percent,
      merchant_outside_percent: this.columnsState.merchant_outside_percent,
      fee_type: this.columnsState.fee_type,
      title: this.columnsState.title,
      offline_merhcant: this.columnsState.offline_merhcant,
      merchant_type: this.columnsState.merchant_type,
      bank_internal_tid: this.columnsState.bank_internal_tid,
      bank_internal_mid: this.columnsState.bank_internal_mid,
    }

    let str = JSON.stringify(locobj)
    let base64 = btoa(str)
    localStorage.setItem('merchant_columns', base64)

  }


  ngOnDestroy(): void {
      this.closeModal.nativeElement?.click()
      this.closeFilters.nativeElement?.click()
      this.closeAddMerchant.nativeElement?.click()
      this.tableSettings.nativeElement?.click()
  }

}

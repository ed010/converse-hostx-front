import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Transactionfilter } from 'src/app/models/transactionfilter';
import { Transactions } from 'src/app/models/transactions.model';
import { TransactionsToExcel } from 'src/app/models/transactionsToExcel';
import { ShowTransactionsService } from 'src/app/services/showTransactions.service';



enum fields {
  transactionId = 1,
  createDate,
  transactionDate,
  bankTid,
  amount,
  authCode,
  appName,
  maskedPan,
  transactionStatus,
  comment,
  cardHolderName,
  transactionType,
  merchantId,
  merchantName,
  bankName,
  payxFee,
  transactionOutOrLocal,
  mcc
}

@Component({
  selector: 'app-hostx-transactions',
  templateUrl: './hostx-transactions.component.html',
  styleUrls: ['./hostx-transactions.component.scss']
})
export class HostxTransactionsComponent implements OnInit {
  transactions:Transactions[] = [];
  showLoader: boolean = false;
  disableNextButton: boolean = false
  page: number = 1
  tzoffset = (new Date()).getTimezoneOffset() * 60000;
  localISOTime = (new Date(Date.now() - this.tzoffset)).toISOString().slice(0, -1);
  // date: string = new Date().toISOString()
  date:any = this.localISOTime
  transactionsCount: number = 0
  transactionsTotalAmount: number = 0

  @ViewChild('closeModal') closeModal: ElementRef


  excelTransactionModel: TransactionsToExcel = new TransactionsToExcel();


  dateFromTo: FormGroup;
  transactionDate: FormGroup;
  transactionsForDateFilter: Transactions[];




  show_transactionId: boolean = true
  show_transactionDate: boolean = true
  show_createDate: boolean = true
  show_trxnType: boolean = true
  show_amount: boolean = true
  show_merchantId: boolean = true
  show_merchantName: boolean = true
  show_domain: boolean = true
  show_authCode: boolean = true
  show_bankTid: boolean = true
  show_bankName: boolean = true
  show_fee: boolean = true
  show_transactionOutOrLocal: boolean = true
  show_cardtype: boolean = true
  show_cardHolderName: boolean = true
  show_comment: boolean = true
  show_appName: boolean = true
  show_mcc: boolean = true
  show_requesttype: boolean = true

  show_maskedPan: boolean = true
  show_transactionStatus: boolean = true
  show_transactionType: boolean = true




  filterSearch = {
    keys:{
      'outside_transactions.id' : '',
      'amount' : '',
      'merchant_id': '',
      'company_name_en': '',
      'auth_code': '',
      'bank_tid': '',
      'bank_name': '',
      'payx_fee': '',
      'card_number': '',
      'comment': '',
      'app_name': '',
      'mcc': '',
      'title': '',
      'transaction_type': '',
      'transaction_out_or_local': '',
      'transaction_status': ''

    },
    creationDateStart: '2018-03-24T10:49:00.795Z',
    creationDateEnd: this.date,
    paymentDateStart: '2018-03-24T10:49:00.795Z',
    paymentDateEnd: this.date
  }

  constructor(
    private transactionService: ShowTransactionsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private shTrSer: ShowTransactionsService,
    private _snackBar: MatSnackBar

  ) { }

  ngOnInit(): void {
    this.builForm();
    this.getLocalStorageFields()

    this.activatedRoute.queryParams
    .subscribe(res =>
      {

        this.filterSearch.keys['outside_transactions.id'] = res['outside_transactions.id'] != undefined ? res['outside_transactions.id'] : ''
        this.filterSearch.keys['amount'] = res['amount'] != undefined ? res['amount'] : ''
        this.filterSearch.keys['merchant_id'] = res['merchant_id'] != undefined ? res['merchant_id'] : ''
        this.filterSearch.keys['company_name_en'] = res['company_name_en'] != undefined ? res['company_name_en'] : ''
        this.filterSearch.keys['auth_code'] = res['auth_code'] != undefined ? res['auth_code'] : ''
        this.filterSearch.keys['bank_tid'] = res['bank_tid'] != undefined ? res['bank_tid'] : ''
        this.filterSearch.keys['bank_name'] = res['bank_name'] != undefined ? res['bank_name'] : ''
        this.filterSearch.keys['card_number'] = res['card_number'] != undefined ? res['card_number'] : ''
        this.filterSearch.keys['comment'] = res['comment'] != undefined ? res['comment'] : ''
        this.filterSearch.keys['app_name'] = res['app_name'] != undefined ? res['app_name'] : ''
        this.filterSearch.keys['mcc'] = res['mcc'] != undefined ? res['mcc'] : ''
        this.filterSearch.keys['title'] = res['title'] != undefined ? res['title'] : ''
        this.filterSearch.keys['transaction_type'] = res['transaction_type'] != undefined ? res['transaction_type'] : ''
        this.filterSearch.keys['transaction_out_or_local'] = res['transaction_out_or_local'] != undefined ? res['transaction_out_or_local'] : ''

        if(res['page']*1 <= 0 || !Number.isInteger(res['page']*1))
          this.page = 1
        else
          this.page = res['page']*1


        this.getTransactions(this.page, this.filterSearch);
      })
  }


  getTransactions(page, filters, count = 100)
  {
    this.showLoader = true
    this.transactionService.getHosXTransactionFilterByPage(page, count, filters).subscribe(
      res =>
      {
        this.disableNextButton = false
        this.transactions = []
        let hold_transactions = res.body as Transactions[]
        // this.transactions = res.body as Transactions[]
        // console.log(hold_transactions)
        this.transactionsCount = parseFloat(res.headers.get('transactioncount'))
        this.transactionsTotalAmount=  parseFloat(res.headers.get('totalamount'))
        if (hold_transactions.length == 0)
        {
          this.disableNextButton = true
        }
        if (hold_transactions.length < count && hold_transactions.length > 0)
        {
          this.disableNextButton = true
          this.transactions = hold_transactions
        }
        if(hold_transactions.length == count)
        {
          this.transactions = hold_transactions
        }

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

  showDataButton() {
    let start = new Date(this.dateFromTo.get("dateRange").get("start").value);
    let end = new Date(this.dateFromTo.get("dateRange").get("end").value);
    if(end.getFullYear() == 1970)
    {
      end = new Date(start)
      end.setDate(start.getDate())
    }
    end.setDate(end.getDate() + 2)
    this.filterSearch.creationDateStart = start.toISOString()
    this.filterSearch.creationDateEnd = end.toISOString()
    this.filter()
    // this.transactionsForDateFilter = this.transactions.filter((filter_data) => {
    //   let object_start_time = new Date(filter_data.createDate).getTime();
    //   if (
    //     this.dateFromTo.get("dateRange").get("start").value != null &&
    //     this.dateFromTo.get("dateRange").get("end").value == null
    //   )
    //     return start.getTime() <= object_start_time;
    //   else if (
    //     this.dateFromTo.get("dateRange").get("start").value == null &&
    //     this.dateFromTo.get("dateRange").get("end").value != null
    //   )
    //     return end.getTime() >= object_start_time;
    //   else
    //     return (
    //       start.getTime() <= object_start_time &&
    //       end.getTime() >= object_start_time
    //     );
    // });
  }


  showDataButton2() {
    let start = new Date(this.transactionDate.get("dateRange").get("start").value);
    let end = new Date(this.transactionDate.get("dateRange").get("end").value);
    if(end.getFullYear() == 1970)
    {
      end = new Date(start)
      end.setDate(start.getDate())
    }
    end.setDate(end.getDate() + 2)
    this.filterSearch.paymentDateStart = start.toISOString()
    this.filterSearch.paymentDateEnd = end.toISOString()
    console.log(this.filterSearch.paymentDateStart)
    console.log(this.filterSearch.paymentDateEnd)
    this.filter()
    // this.transactionsForDateFilter = this.transactions.filter((filter_data) => {
    //   let object_start_time = new Date(filter_data.createDate).getTime();
    //   if (
    //     this.transactionDate.get("dateRange").get("start").value != null &&
    //     this.transactionDate.get("dateRange").get("end").value == null
    //   )
    //     return start.getTime() <= object_start_time;
    //   else if (
    //     this.transactionDate.get("dateRange").get("start").value == null &&
    //     this.transactionDate.get("dateRange").get("end").value != null
    //   )
    //     return end.getTime() >= object_start_time;
    //   else
    //     return (
    //       start.getTime() <= object_start_time &&
    //       end.getTime() >= object_start_time
    //     );
    // });
  }


  builForm() {
    this.dateFromTo = this.formBuilder.group({
      dateRange: new FormGroup({
        start: new FormControl(),
        end: new FormControl(),
      }),
    });

    this.transactionDate = this.formBuilder.group({
      dateRange: new FormGroup({
        start: new FormControl(),
        end: new FormControl(),
      }),
    });
  }

  resetDate() {
    this.dateFromTo.get("dateRange").get("start").reset();
    this.dateFromTo.get("dateRange").get("end").reset();
    // this.transactionsForDateFilter = this.transactions;
  }
  resetDate2() {
    this.transactionDate.get("dateRange").get("start").reset();
    this.transactionDate.get("dateRange").get("end").reset();
    // this.transactionsForDateFilter = this.transactions;
  }

  resetFilters()
  {
    this.filterSearch = {
      keys:{
        'outside_transactions.id' : '',
        'amount' : '',
        'merchant_id': '',
        'company_name_en': '',
        'auth_code': '',
        'bank_tid': '',
        'bank_name': '',
        'payx_fee': '',
        'card_number': '',
        'comment': '',
        'app_name': '',
        'mcc': '',
        'title': '',
        'transaction_type': '',
        'transaction_out_or_local': '',
        'transaction_status': ''

      },
      creationDateStart: '2018-03-24T10:49:00.795Z',
      creationDateEnd: this.date,
      paymentDateStart: '2018-03-24T10:49:00.795Z',
      paymentDateEnd: this.date
    }
    let queryParams = {'page': 1}


    this.router.navigateByUrl('/admin/transactions?page=1')
    this.closeModal.nativeElement.click()
  }

  filter()
  {
    let queryParams = {}

    for (let i in this.filterSearch.keys){
      if(this.filterSearch.keys[i] != '')
      {
        queryParams[`${i}`] = this.filterSearch.keys[i]
      }
      else
      {
        queryParams[`${i}`]=''
      }
    }
    queryParams['creationDateStart'] = this.filterSearch.creationDateStart
    queryParams['creationDateEnd'] = this.filterSearch.creationDateEnd
    queryParams['paymentDateStart'] = this.filterSearch.paymentDateStart
    queryParams['paymentDateEnd'] = this.filterSearch.paymentDateEnd
    this.router.navigate([],{
      queryParamsHandling: 'merge',
      relativeTo: this.activatedRoute,
      queryParams: queryParams
    })
    console.log(queryParams)
    this.closeModal.nativeElement.click()
  }

  aaa(){
    console.log('okkkkkk')
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
      relativeTo: this.activatedRoute,
      queryParams: queryParams,
    })
  }

  getLocalStorageFields()
  {
    if(localStorage.getItem('fields_hx'))
    {
      let l_str = JSON.parse(localStorage.getItem('fields_hx'))
      this.show_transactionId = l_str.transactionid
      this.show_transactionDate = l_str.transactionDate
      this.show_createDate = l_str.createDate
      this.show_trxnType = l_str.trxntype
      this.show_amount = l_str.amount
      this.show_merchantId = l_str.iid
      this.show_merchantName = l_str.merchantName
      this.show_domain = l_str.domain
      this.show_authCode = l_str.authCode
      this.show_bankTid = l_str.tid
      this.show_bankName = l_str.bank
      this.show_fee = l_str.fee
      this.show_transactionOutOrLocal = l_str.outOrLocal
      this.show_cardtype = l_str.cardType
      this.show_cardHolderName = l_str.cardHolderName
      this.show_comment = l_str.comment
      this.show_appName = l_str.appName
      this.show_mcc = l_str.mcc
      this.show_requesttype = l_str.requestType
      this.show_transactionStatus = l_str.transactionStatus
    }
    else return
  }

  changeColumn(){
    let locobj = {
      transactionid: this.show_transactionId,
      transactionDate: this.show_transactionDate,
      createDate: this.show_createDate,
      trxntype: this.show_trxnType,
      amount: this.show_amount,
      iid: this.show_merchantId,
      merchantName: this.show_merchantName,
      domain: this.show_domain,
      authCode: this.show_authCode,
      tid: this.show_bankTid,
      bank: this.show_bankName,
      fee: this.show_fee,
      outOrLocal: this.show_transactionOutOrLocal,
      cardType: this.show_cardtype,
      cardHolderName: this.show_cardHolderName,
      comment: this.show_comment,
      appName: this.show_appName,
      mcc: this.show_mcc,
      requestType: this.show_requesttype,
      transactionStatus: this.show_transactionStatus
    }

    let str = JSON.stringify(locobj)
    localStorage.setItem('fields_hx', str)

  }

  createExcelModel() {

    this.excelTransactionModel.transactions = this.transactions
    this.excelTransactionModel.keys.set("A", {
      name: "Transaction ID",
      status: this.show_transactionId,
      id: fields.transactionId,
    });
    this.excelTransactionModel.keys.set("B", {
      name: "Request date ",
      status: this.show_createDate,
      id: fields.createDate,
    });
    this.excelTransactionModel.keys.set("C", {
      name: "Payment date",
      status: this.show_transactionDate,
      id: fields.transactionDate,
    });
    this.excelTransactionModel.keys.set("D", {
      name: "Department",
      status: this.show_bankTid,
      id: fields.bankTid,
    });
    this.excelTransactionModel.keys.set("E", {
      name: "Amount",
      status: this.show_amount,
      id: fields.amount,
    });
    this.excelTransactionModel.keys.set("F", {
      name: "Authorization code",
      status: this.show_authCode,
      id: fields.authCode,
    });
    this.excelTransactionModel.keys.set("G", {
      name: "Payer app",
      status: this.show_appName,
      id: fields.appName,
    });
    this.excelTransactionModel.keys.set("H", {
      name: "Card type",
      status: this.show_maskedPan,
      id: fields.maskedPan,
    });
    this.excelTransactionModel.keys.set("I", {
      name: "Payment type",
      status: this.show_transactionStatus,
      id: fields.transactionStatus,
    });
    this.excelTransactionModel.keys.set("J", {
      name: "Comments",
      status: this.show_comment,
      id: fields.comment,
    });
    this.excelTransactionModel.keys.set("K", {
      name: "Card Holder Name",
      status: this.show_cardHolderName,
      id: fields.cardHolderName,
    });
    this.excelTransactionModel.keys.set("L", {
      name: "Transaction type",
      status: this.show_transactionType,
      id: fields.transactionType,
    });
    this.excelTransactionModel.keys.set("M", {
      name: "Merchant ID",
      status: this.show_merchantId,
      id: fields.merchantId,
    });
    this.excelTransactionModel.keys.set("N", {
      name: "Merchant name",
      status: this.show_merchantName,
      id: fields.merchantName,
    });
    this.excelTransactionModel.keys.set("O", {
      name: "Bank name",
      status: this.show_bankName,
      id: fields.bankName,
    });
    this.excelTransactionModel.keys.set("P", {
      name: "FEE",
      status: this.show_fee,
      id: fields.payxFee,
    });
    this.excelTransactionModel.keys.set("Q", {
      name: "Out or Local",
      status: this.show_transactionOutOrLocal,
      id: fields.transactionOutOrLocal,
    });
    this.excelTransactionModel.keys.set("R", {
      name: "MCC",
      status: this.show_mcc,
      id: fields.mcc,
    });
    const convMap = {};
    this.excelTransactionModel.keys.forEach((val: string, key: string) => {
      convMap[key] = val;
    });
    let obj = {
      keys: convMap,
      transactions: this.excelTransactionModel.transactions,
    };
    this.shTrSer.endTransactionsForExcel(obj).subscribe((res) => {
      let currentDate = new Date();
      let dformat =
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
      // saveAs(res)
      let blob = new Blob([res], { type: "application/octet-stream" });
      let url = window.URL.createObjectURL(blob);
      let anchor = document.createElement("a");
      anchor.download = `PXtransactions-${dformat}.xlsx`;
      anchor.href = url;
      anchor.click();
    },
    err =>{
      let errmer = err?.error?.message
      this._snackBar.open(errmer,'', {
        duration: 7000
      });
    }
    );
  }

  ngOnDestroy(): void {
    this.closeModal.nativeElement?.click()
  }
}

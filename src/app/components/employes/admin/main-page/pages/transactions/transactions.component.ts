import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Transactionfilter } from 'src/app/models/transactionfilter';
import { Transactions } from 'src/app/models/transactions.model';
import { ShowTransactionsService } from 'src/app/services/showTransactions.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit, OnDestroy {

  transactions:Transactions[] = [];
  showLoader: boolean = false;
  disableNextButton: boolean = false
  page: number = 1
  pageSize: number = 100
  transactionsCount: number = 0
  transactionsTotalAmount: number = 0

  private preserveCreatePickerValues = false;
  private preservePaymentPickerValues = false;
  private createDateApplied = false;
  private paymentDateApplied = false;
  private readonly defaultCreateDateStart = "2018-03-24T00:00:00.000Z";
  private readonly defaultPaymentDateStart = "1753-01-01T00:00:00.000Z";

  @ViewChild('closeModal') closeModal: ElementRef

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
  show_cardtype: boolean = true
  show_cardHolderName: boolean = true
  show_comment: boolean = true
  show_appName: boolean = true
  show_mcc: boolean = true
  show_requesttype: boolean = true

  show_maskedPan: boolean = true
  show_transactionStatus: boolean = true
  show_transactionType: boolean = true

  downloadExcelLoader: boolean = false
  curStatus: number = 5;
  checkingStatusOrderId: string | null = null;




  filterSearch = {
    keys:{
      'transactions.id' : '',
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
      'transaction_status': ''

    },
    ...this.buildDefaultCreateDateRange(),
    ...this.buildDefaultPaymentDateRange(),
  }

  constructor(
    private transactionService: ShowTransactionsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private shTrSer: ShowTransactionsService,
    private _snackBar: MatSnackBar,
    private datePipe: DatePipe

  ) { }

  ngOnInit(): void {
    this.builForm();
    this.getLocalStorageFields()

    this.activatedRoute.queryParams
    .subscribe(res =>
      {

        this.filterSearch.keys['transactions.id'] = res['transactions.id'] != undefined ? res['transactions.id'] : ''
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
        this.filterSearch.keys['transaction_status'] = res['transaction_status'] != undefined ? res['transaction_status'] : ''
        this.curStatus = this.mapTransactionStatusToCurStatus(
          this.filterSearch.keys['transaction_status']
        );

        if (this.applyDateFiltersFromQueryParams(res)) {
          return;
        }

        if(res['page']*1 <= 0 || !Number.isInteger(res['page']*1))
          this.page = 1
        else
          this.page = res['page']*1


        this.getTransactions(this.page, this.filterSearch);
      })
  }


  getTransactions(page, filters:Transactionfilter, size = this.pageSize)
  {
    this.showLoader = true
    this.transactionService.getTransactionFilterByPage(page, size, filters).subscribe(
      res =>
      {
        const responseBody: any = res.body || {};
        this.disableNextButton = false
        this.transactions = []
        let hold_transactions = this.normalizeTransactions(responseBody.transactions)
        this.transactionsCount = this.toSafeNumber(responseBody.totalCount)
        this.transactionsTotalAmount=  this.toSafeNumber(responseBody.totalAmount)
        if (hold_transactions.length == 0)
        {
          this.disableNextButton = true
        }
        if (hold_transactions.length < size && hold_transactions.length > 0)
        {
          this.disableNextButton = true
          this.transactions = hold_transactions
        }
        if(hold_transactions.length == size)
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

  private normalizeTransactions(transactions: any[] = []): Transactions[] {
    return transactions.map((transaction: any) => ({
      ...transaction,
      card: {
        ...transaction?.card,
        maskedPan: transaction?.card?.maskedPan ?? transaction?.card?.cardNumber ?? "",
        cardHolderName: transaction?.card?.cardHolderName ?? transaction?.card?.cardFullname ?? "",
      },
    }));
  }

  private toSafeNumber(value): number {
    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? 0 : numericValue;
  }

  showDataButton() {
    const startVal = this.dateFromTo.get("dateRange").get("start").value;
    const endVal = this.dateFromTo.get("dateRange").get("end").value;

    if (!startVal) {
      return;
    }

    const start = new Date(startVal);
    const end = endVal ? new Date(endVal) : new Date(startVal);

    if (start.getFullYear() === 1970) {
      return;
    }

    this.filterSearch.creationDateStart = this.toUtcMidnightIso(start);
    this.filterSearch.creationDateEnd = this.toUtcEndOfDayIso(end);
    this.createDateApplied = true;
    this.preserveCreatePickerValues = true;
    this.page = 1;
    this.applyFiltersToUrl({ page: 1 });
  }


  showDataButton2() {
    const startVal = this.transactionDate.get("dateRange").get("start").value;
    const endVal = this.transactionDate.get("dateRange").get("end").value;

    if (!startVal) {
      return;
    }

    const start = new Date(startVal);
    const end = endVal ? new Date(endVal) : new Date(startVal);

    if (start.getFullYear() === 1970) {
      return;
    }

    this.filterSearch.paymentDateStart = this.toUtcMidnightIso(start);
    this.filterSearch.paymentDateEnd = this.toUtcEndOfDayIso(end);
    this.paymentDateApplied = true;
    this.preservePaymentPickerValues = true;
    this.page = 1;
    this.applyFiltersToUrl({ page: 1 });
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
    this.preserveCreatePickerValues = false;
    this.createDateApplied = false;
    Object.assign(this.filterSearch, this.buildDefaultCreateDateRange());
    this.clearCreateDateForm();
    this.page = 1;
    this.applyFiltersToUrl({
      page: 1,
      creationDateStart: null,
      creationDateEnd: null,
    });
  }

  resetDate2() {
    this.preservePaymentPickerValues = false;
    this.paymentDateApplied = false;
    Object.assign(this.filterSearch, this.buildDefaultPaymentDateRange());
    this.clearPaymentDateForm();
    this.page = 1;
    this.applyFiltersToUrl({
      page: 1,
      paymentDateStart: null,
      paymentDateEnd: null,
    });
  }

  resetFilters()
  {
    this.curStatus = 5;
    this.createDateApplied = false;
    this.paymentDateApplied = false;
    this.preserveCreatePickerValues = false;
    this.preservePaymentPickerValues = false;
    this.filterSearch = {
      keys:{
        'transactions.id' : '',
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
        'transaction_status': ''

      },
      ...this.buildDefaultCreateDateRange(),
      ...this.buildDefaultPaymentDateRange(),
    }
    this.clearCreateDateForm();
    this.clearPaymentDateForm();
    this.router.navigateByUrl('/admin/transactions?page=1')
    this.closeModal.nativeElement.click()
  }

  filter()
  {
    this.page = 1;
    this.applyFiltersToUrl({ page: 1 });
    this.closeModal.nativeElement.click()
  }

  private applyFiltersToUrl(extra: Params = {}) {
    const queryParams: Params = { ...extra };

    for (const key in this.filterSearch.keys) {
      queryParams[key] = this.filterSearch.keys[key] || "";
    }

    if (this.createDateApplied) {
      queryParams["creationDateStart"] = this.filterSearch.creationDateStart;
      queryParams["creationDateEnd"] = this.filterSearch.creationDateEnd;
    } else {
      queryParams["creationDateStart"] = null;
      queryParams["creationDateEnd"] = null;
    }

    if (this.paymentDateApplied) {
      queryParams["paymentDateStart"] = this.filterSearch.paymentDateStart;
      queryParams["paymentDateEnd"] = this.filterSearch.paymentDateEnd;
    } else {
      queryParams["paymentDateStart"] = null;
      queryParams["paymentDateEnd"] = null;
    }

    this.router.navigate([], {
      queryParamsHandling: "merge",
      relativeTo: this.activatedRoute,
      queryParams,
    });
  }

  private applyDateFiltersFromQueryParams(res: Params): boolean {
    const urlCreateStart = res["creationDateStart"] as string | undefined;
    const urlCreateEnd = res["creationDateEnd"] as string | undefined;
    const hasValidCreateRange =
      !!urlCreateStart &&
      !!urlCreateEnd &&
      !this.isLegacyCreateDateStart(urlCreateStart);

    if (hasValidCreateRange) {
      this.filterSearch.creationDateStart = urlCreateStart;
      this.filterSearch.creationDateEnd = urlCreateEnd;
      this.createDateApplied = true;
      if (!this.preserveCreatePickerValues) {
        this.setCreateDateForm(urlCreateStart, urlCreateEnd);
      } else {
        this.preserveCreatePickerValues = false;
      }
    } else {
      Object.assign(this.filterSearch, this.buildDefaultCreateDateRange());
      this.createDateApplied = false;
      if (!this.preserveCreatePickerValues) {
        this.clearCreateDateForm();
      } else {
        this.preserveCreatePickerValues = false;
      }
      if (urlCreateStart || urlCreateEnd) {
        this.router.navigate([], {
          queryParamsHandling: "merge",
          relativeTo: this.activatedRoute,
          queryParams: {
            creationDateStart: null,
            creationDateEnd: null,
          },
        });
        return true;
      }
    }

    const urlPaymentStart = res["paymentDateStart"] as string | undefined;
    const urlPaymentEnd = res["paymentDateEnd"] as string | undefined;
    const hasValidPaymentRange = !!urlPaymentStart && !!urlPaymentEnd;

    if (hasValidPaymentRange) {
      this.filterSearch.paymentDateStart = urlPaymentStart;
      this.filterSearch.paymentDateEnd = urlPaymentEnd;
      this.paymentDateApplied = true;
      if (!this.preservePaymentPickerValues) {
        this.setPaymentDateForm(urlPaymentStart, urlPaymentEnd);
      } else {
        this.preservePaymentPickerValues = false;
      }
    } else {
      Object.assign(this.filterSearch, this.buildDefaultPaymentDateRange());
      this.paymentDateApplied = false;
      if (!this.preservePaymentPickerValues) {
        this.clearPaymentDateForm();
      } else {
        this.preservePaymentPickerValues = false;
      }
      if (urlPaymentStart || urlPaymentEnd) {
        this.router.navigate([], {
          queryParamsHandling: "merge",
          relativeTo: this.activatedRoute,
          queryParams: {
            paymentDateStart: null,
            paymentDateEnd: null,
          },
        });
        return true;
      }
    }

    return false;
  }

  private buildDefaultCreateDateRange() {
    return {
      creationDateStart: this.defaultCreateDateStart,
      creationDateEnd: this.toUtcEndOfDayIso(new Date()),
    };
  }

  private buildDefaultPaymentDateRange() {
    return {
      paymentDateStart: this.defaultPaymentDateStart,
      paymentDateEnd: this.toUtcEndOfDayIso(new Date()),
    };
  }

  private clearCreateDateForm() {
    if (!this.dateFromTo) {
      return;
    }
    const range = this.dateFromTo.get("dateRange");
    range.patchValue({ start: null, end: null });
    range.get("start")?.setValue(null);
    range.get("end")?.setValue(null);
    range.markAsPristine();
    range.markAsUntouched();
  }

  private clearPaymentDateForm() {
    if (!this.transactionDate) {
      return;
    }
    const range = this.transactionDate.get("dateRange");
    range.patchValue({ start: null, end: null });
    range.get("start")?.setValue(null);
    range.get("end")?.setValue(null);
    range.markAsPristine();
    range.markAsUntouched();
  }

  private setCreateDateForm(startIso: string, endIso: string) {
    if (!this.dateFromTo) {
      return;
    }
    const range = this.dateFromTo.get("dateRange");
    range.patchValue({
      start: this.parseUtcDateParam(startIso),
      end: this.parseUtcDateParam(endIso),
    });
  }

  private setPaymentDateForm(startIso: string, endIso: string) {
    if (!this.transactionDate) {
      return;
    }
    const range = this.transactionDate.get("dateRange");
    range.patchValue({
      start: this.parseUtcDateParam(startIso),
      end: this.parseUtcDateParam(endIso),
    });
  }

  private parseUtcDateParam(value: string): Date | null {
    if (!value) {
      return null;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return new Date(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate()
    );
  }

  private isLegacyCreateDateStart(value: string): boolean {
    return !value || value.startsWith("2018-03-24T10:49");
  }

  private toUtcMidnightIso(date: Date): string {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    ).toISOString();
  }

  private toUtcEndOfDayIso(date: Date): string {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 0, 0)
    ).toISOString();
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
    if(localStorage.getItem('fields'))
    {
      let l_str = JSON.parse(localStorage.getItem('fields'))
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
      cardType: this.show_cardtype,
      cardHolderName: this.show_cardHolderName,
      comment: this.show_comment,
      appName: this.show_appName,
      mcc: this.show_mcc,
      requestType: this.show_requesttype,
      transactionStatus: this.show_transactionStatus
    }

    let str = JSON.stringify(locobj)
    localStorage.setItem('fields', str)

  }

  selectStatus(val: number) {
    this.curStatus = val * 1;
    this.filterSearch.keys.transaction_status =
      this.curStatus === 5 ? "" : String(this.curStatus);
    this.page = 1;
    this.router.navigate([], {
      queryParamsHandling: "merge",
      relativeTo: this.activatedRoute,
      queryParams: {
        page: 1,
        transaction_status: this.filterSearch.keys.transaction_status,
      },
    });
  }

  private mapTransactionStatusToCurStatus(value: string): number {
    switch (value) {
      case "2":
        return 2;
      case "0":
        return 0;
      case "3":
        return 3;
      case "4":
        return 4;
      default:
        return 5;
    }
  }

  createExcelModel() {
    this.downloadExcelLoader = true;

    const body = {
      pageNumber: this.page > 0 ? this.page : 1,
      count: this.pageSize,
      startDate: this.filterSearch.creationDateStart,
      endDate: this.filterSearch.creationDateEnd,
      status: this.curStatus === 5 ? null : this.curStatus,
    };

    this.shTrSer.exportTransactionForAdmin(body).subscribe(
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
        anchor.download = `Transactions-${dformat}.xlsx`;
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

  getTransactionDate(date): string
  {
    let d = new Date(date);
    if(d.getFullYear() >= 2035 || d.getFullYear() <= 2015)
    {
      return "-";
    }

    return this.datePipe.transform(date, "dd/MM/yy HH:mm");
  }

  checkTransactionStatus(transaction: Transactions) {
    const orderId = transaction.hashOrderId;
    if (!orderId) {
      this._snackBar.open("Order ID not found", "", {
        duration: 7000,
      });
      return;
    }

    this.checkingStatusOrderId = orderId;
    this.shTrSer.checkStatus(orderId).subscribe(
      (res: any) => {
        this.checkingStatusOrderId = null;
        if (res?.success) {
          this._snackBar.open("Status checked successfully", "", {
            duration: 7000,
          });
          this.getTransactions(this.page, this.filterSearch);
          return;
        }

        const message =
          res?.errorMessage || res?.errorCode || "Check status failed";
        this._snackBar.open(message, "", {
          duration: 7000,
        });
      },
      (err) => {
        this.checkingStatusOrderId = null;
        const message =
          err?.error?.errorMessage ||
          err?.error?.message ||
          "Check status failed";
        this._snackBar.open(message, "", {
          duration: 7000,
        });
      }
    );
  }


  refreshPage()
  {
    console.log('clicked')
    this.ngOnInit()
  }
  ngOnDestroy(): void {
    this.closeModal.nativeElement?.click()
  }
}

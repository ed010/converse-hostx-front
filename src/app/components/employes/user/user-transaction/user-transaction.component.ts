import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Subscription } from "rxjs";
import { MerchantIdTitle } from "src/app/models/merchantIdTitle";
import { MerchantInfo } from "src/app/models/merchantInfo.model";
import { Transactions } from "src/app/models/transactions.model";
import { DataExchangeService } from "src/app/services/dataExchange.service";
import { GetMerchantForUserService } from "src/app/services/getMerchantForUser.service";
import { ShowTransactionsService } from "src/app/services/showTransactions.service";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { SmsService } from "src/app/services/sms.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-user-transaction",
  templateUrl: "./user-transaction.component.html",
  styleUrls: ["./user-transaction.component.css"],
})
export class UserTransactionComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  merchants: MerchantIdTitle[];
  transactions: Transactions[];
  currentTransaction: Transactions;
  transactionsForDateFilter: Transactions[];
  dataExchange: Subscription;
  changedId: MerchantIdTitle;
  merchantId: number;
  merchantIdSubscription: Subscription;
  merchantIdSubscriptionCheck: boolean;
  paidUnpaid: number;
  showData: Transactions;
  transactionCount: number = 0;
  showLoader: boolean = false;
  blob: Blob;
  modalIf: boolean = false;
  selectedOption: boolean = false;

  addCardHolderName: boolean = false;
  inqDate: boolean = false;
  payerApp: boolean = true;
  comment: boolean = true;
  state: boolean = true;
  cardType: boolean = true;

  sortToggle: boolean = false;
  showModalInfo: boolean = false;
  dateFromTo: FormGroup;
  emailSend: FormGroup;
  errorSendMailSms: boolean = false;
  sendedSms: boolean = false;
  disableEmailButton: boolean = false;
  canReverseMerchant: boolean = false;
  canRefundMerchant: boolean = false;
  refverseErrorMsg: boolean = false;
  getNotification: Subscription;

  page: number = 1;
  tin: string;
  merchantInfo: MerchantInfo | null = null;

  errorRefund: boolean = false;
  sendedRefund: boolean = false;
  disableRefundButton: boolean = false;
  checkStatusLoader: boolean = false;
  refundSend: FormGroup;
  refundHistory: { id: number; transactionId: number; amount: number; date: string }[] =
    [];

  curStatus: number;
  private preservePickerValues = false;

  dateFilters = {
    start: "",
    end: "",
  };

  constructor(
    private dataEx: DataExchangeService,
    private getMerFUser: GetMerchantForUserService,
    private shTrSer: ShowTransactionsService,
    private formBuilder: FormBuilder,
    private sms: SmsService,
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService
  ) {
    Object.assign(this.dateFilters, this.buildDefaultApiDateFilters());
  }

  /** Point of sale — localized company name from GetMerchantUser.merchantInfo */
  get receiptDepartmentName(): string {
    const info = this.merchantInfo;
    if (!info) {
      return this.currentTransaction?.merchantName ?? "";
    }
    const lang = this.currentUiLang();
    if (lang === "am") {
      return info.companyNameHy || info.companyNameEn || "";
    }
    if (lang === "ru") {
      return info.companyNameRu || info.companyNameEn || "";
    }
    return info.companyNameEn || info.companyNameHy || "";
  }

  /** Receipt address — am: addressHy; en/ru: addressEn */
  get receiptAddress(): string {
    const info = this.merchantInfo;
    if (!info) {
      return "";
    }
    if (this.currentUiLang() === "am") {
      return info.addressHy || info.addressEn || "";
    }
    return info.addressEn || info.addressHy || "";
  }

  private currentUiLang(): string {
    return (
      this.translate.currentLang ||
      localStorage.getItem("lang") ||
      "en"
    );
  }

  @ViewChild("downloadExcel") downloadExcel: ElementRef;
  @ViewChild("infoModal") infoModal: ElementRef;
  @ViewChild("myPaginator") myPaginator: MatPaginator;
  @ViewChild("paidUnpaid_s") paidUnpaid_s: ElementRef;
  @ViewChild("reverseModal") reverseModal: ElementRef;
  @ViewChild("disableReverseBtn") disableReverseBtn: ElementRef;

  // myPaginator: MatPaginator

  ngAfterViewInit(): void {
    // let pageCount = this.transactionCount / 50 + 1
    // this.myPaginator.pageIndex = this.page - 1
  }

  ngOnInit(): void {
    this.builForm();
    this.route.queryParams.subscribe((res) => {
      this.getNotification = this.dataEx.getNotification().subscribe(
        (res) => {
          console.log("qr res", res);
          if (res == "true") {
            this.page = 1;
            this.ngOnInit();
          }
        },
        (err) => {
          let errmer = err.error.message;
          this._snackBar.open(errmer, "", {
            duration: 2000,
          });
        }
      );
      this.getLocalStorageFields();
      if (
        res["page"] * 1 <= 0 ||
        !Number.isInteger(res["page"] * 1) ||
        res["page"] == undefined
      )
        this.page = 1;
      else this.page = res["page"] * 1;
      const urlStart = res["start"] as string | undefined;
      const urlEnd = res["end"] as string | undefined;
      if (urlStart && urlEnd) {
        this.dateFilters.start = urlStart;
        this.dateFilters.end = urlEnd;
      } else {
        Object.assign(this.dateFilters, this.buildDefaultApiDateFilters());
        if (urlStart || urlEnd) {
          this.router.navigate([], {
            queryParamsHandling: "merge",
            relativeTo: this.route,
            queryParams: { start: null, end: null },
          });
          return;
        }
      }
      if (!this.preservePickerValues) {
        this.clearDateRangeForm();
      } else {
        this.preservePickerValues = false;
      }
      let status =
        res["status"] == "paid"
          ? 2
          : res["status"] == "unpaid"
          ? 0
          : res["status"] == "reverse"
          ? 3
          : res["status"] == "refund"
          ? 4
          : 5;
      this.curStatus = status;
      let el = document.getElementById("select-type") as HTMLSelectElement;
      el.value = status.toString();
      const get_id_promise = new Promise((reslove, reject) => {
        let id = localStorage.getItem("id");
        reslove(id);
      });
      get_id_promise.then((data) => {
        this.getMerFUser.getMerchantUser(data).subscribe((res) => {
          this.merchants = res.merchants;
          this.merchantInfo = res.merchantInfo ?? null;
          if (res.merchantInfo?.tin) {
            this.tin = res.merchantInfo.tin;
          }
          this.canReverseMerchant = !!res.canReverse;
          this.canRefundMerchant = !!res.canRefund;
          // console.log(this.canReverseMerchant);
          this.getTransactionsFuction(status, this.page);
        });
      });
      // this.merchantIdSubscription = this.dataEx.getMerId().subscribe(
      //   res => {
      //     this.merchantId = res
      //     this.getTransactionsFuction(this.merchantId)
      //   }
      // );
      this.dataExchange = this.dataEx.getMerchantTr().subscribe((res) => {
        this.changedId = res;
        this.selectedOption = true;
        this.getTransactionsFuction(status, this.page);
      });
    });
  }

  setToLocalStorage() {
    let locobj = {
      addCardHolderName: this.addCardHolderName,
      inqDate: this.inqDate,
      payerApp: this.payerApp,
      comment: this.comment,
      state: this.state,
      cardType: this.cardType,
    };
    let str = JSON.stringify(locobj);
    localStorage.setItem("fields_u", str);
  }

  getLocalStorageFields() {
    if (localStorage.getItem("fields_u")) {
      let l_str = JSON.parse(localStorage.getItem("fields_u"));
      this.addCardHolderName = l_str.addCardHolderName;
      this.inqDate = l_str.inqDate;
      this.payerApp = l_str.payerApp;
      this.comment = l_str.comment;
      this.state = l_str.state;
      this.cardType = l_str.cardType;
    } else return;
  }

  getTransactionsFuction(status, page) {
    this.showLoader = true;
    this.myPaginator.pageIndex = this.page - 1;
    /** UI uses 5 for "all"; API expects null for no status filter. */
    const statusForRequest =
      status === 5 || status === "5" ? null : status;
    this.getMerFUser
      .getTransactions(statusForRequest, page, this.dateFilters)
      .subscribe(
        (res) => {
          const body = res.body as any;
          this.transactions = body["transactions"] as Transactions[];
          if (body["tin"]) {
            this.tin = body["tin"] as string;
          }
          const headerCount = res.headers.get("count");
          this.transactionCount =
            body["count"] != null && !Number.isNaN(Number(body["count"]))
              ? Number(body["count"])
              : headerCount != null
              ? parseInt(headerCount, 10)
              : this.transactions?.length ?? 0;
          // this.transactions.sort(function(a,b){
          //   return new Date(a.createDate).valueOf() - new Date(b.createDate).valueOf();
          //   return a.createDate.getTime() - b.createDate.getTime()
          // })
          // this.transactions.sort((b, a) => (new Date(a.createDate).getTime()  > new Date(b.createDate).getTime()) ? 1 : (new Date(a.createDate).getTime() === new Date(b.createDate).getTime()) ? ((new Date(a.createDate).getTime() > new Date(b.createDate).getTime()) ? 1 : -1) : -1 )
          this.transactions.sort((b, a) =>
            new Date(a.createDate).getTime() > new Date(b.createDate).getTime()
              ? 1
              : -1
          );
          this.transactions.forEach((value, index) => {
            value["id"] = this.transactions.length - index;
          });
          this.transactionsForDateFilter = this.transactions;
          this.showLoader = false;
        },
        (err) => {
          if (this.transactions)
            this.transactions.splice(0, this.transactions.length);
          let errmer = err?.error?.message;
          this._snackBar.open(errmer, "", {
            duration: 2000,
          });
          this.showLoader = false;
        }
      );
  }
  selectPaidUnpaid(val: number) {
    // this.showLoader = true;
    this.selectedOption = false;
    this.page = 1;
    let queryParams = {};
    if (val * 1 == 2) queryParams["status"] = "paid";
    else if (val * 1 == 0) queryParams["status"] = "unpaid";
    else if (val * 1 == 3) queryParams["status"] = "reverse";
    else if (val * 1 == 4) queryParams["status"] = "refund";
    else queryParams["status"] = "all";

    queryParams["page"] = 1;

    this.router.navigate([], {
      queryParamsHandling: "merge",
      relativeTo: this.route,
      queryParams: queryParams,
    });
    this.getTransactionsFuction(val * 1, this.page);
  }
  sendData(data: Transactions) {
    this.modalIf = true;
    this.showData = data;
  }
  openReciept(data: Transactions) {
    this.currentTransaction = data;
    this.showModalInfo = true;
    this.refundHistory = [];
    this.emailSend?.reset();
    this.errorSendMailSms = false;
    this.sendedSms = false;
    this.refundSend?.reset();
    this.errorRefund = false;
    this.sendedRefund = false;
    if (this.canRefundTransaction(data)) {
      this.loadRefundHistory(data.transactionId);
    }
  }

  private canRefundTransaction(transaction: Transactions): boolean {
    return (
      this.canRefundMerchant &&
      (transaction.transactionStatus === 2 ||
        transaction.transactionStatus === 4)
    );
  }

  get totalRefundedAmount(): number {
    if (this.refundHistory.length > 0) {
      return this.refundHistory.reduce((sum, item) => sum + item.amount, 0);
    }
    return Number(this.currentTransaction?.refundedAmount ?? 0);
  }

  private loadRefundHistory(transactionId: number) {
    this.shTrSer.getRefundHistory(transactionId).subscribe(
      (history) => {
        this.refundHistory = Array.isArray(history) ? history : [];
      },
      () => {
        this.refundHistory = [];
      }
    );
  }

  checkTransactionStatus(transaction: Transactions) {
    const orderId = transaction.hashOrderId;
    if (!orderId) {
      this._snackBar.open("Order ID not found", "", {
        duration: 7000,
      });
      return;
    }

    this.checkStatusLoader = true;
    this.shTrSer.checkStatus(orderId).subscribe(
      (res: any) => {
        this.checkStatusLoader = false;
        if (res?.success) {
          this._snackBar.open("Status checked successfully", "", {
            duration: 7000,
          });
          this.getTransactionsFuction(this.curStatus, this.page);
          return;
        }

        const message =
          res?.errorMessage || res?.errorCode || "Check status failed";
        this._snackBar.open(message, "", {
          duration: 7000,
        });
      },
      (err) => {
        this.checkStatusLoader = false;
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

  closeModal() {
    this.refverseErrorMsg = false;
    this.infoModal.nativeElement.click();
  }

  reverseTransaction(obj: Transactions) {
    this.refverseErrorMsg = false;
    this.shTrSer.reverseTransaction(obj.transactionId).subscribe(
      (res) => {
        const body: any = res.body;
        if (body?.success === false) {
          this.refverseErrorMsg = true;
          this._snackBar.open(
            body?.errorMessage || body?.errorCode || "Reverse failed",
            "",
            { duration: 7000 }
          );
          return;
        }

        this.reverseModal.nativeElement.click();
        this.getTransactionsFuction(this.curStatus, this.page);
      },
      (err) => {
        this.refverseErrorMsg = true;
        const message =
          err?.error?.errorMessage ||
          err?.error?.message ||
          "Reverse failed";
        this._snackBar.open(message, "", { duration: 7000 });
      }
    );
  }

  private getApiErrorMessage(response: any, fallback: string): string {
    return (
      response?.errorMessage ||
      response?.errorCode ||
      response?.message ||
      fallback
    );
  }

  sortByDate() {
    this.sortToggle = !this.sortToggle;
    if (this.sortToggle)
      this.transactions.sort((a, b) =>
        new Date(a.createDate).getTime() > new Date(b.createDate).getTime()
          ? 1
          : -1
      );
    else
      this.transactions.sort((b, a) =>
        new Date(a.createDate).getTime() > new Date(b.createDate).getTime()
          ? 1
          : -1
      );
  }

  createExcelModel() {
    const merchantId =
      this.changedId == undefined ? this.dataEx.retId() : this.changedId.id;

    const body = {
      id: merchantId ?? 0,
      page: 0,
      count: 0,
      status: this.curStatus === 5 ? null : this.curStatus,
      start: this.dateFilters.start,
      end: this.dateFilters.end,
    };

    this.shTrSer.exportTransactionsExcel(body).subscribe(
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
        anchor.download = `PayXTransactions-${dformat}.xlsx`;
        anchor.href = url;
        anchor.click();
        window.URL.revokeObjectURL(url);
      },
      (err) => {
        const errmer = err?.error?.message;
        this._snackBar.open(errmer, "", {
          duration: 7000,
        });
      }
    );
  }

  getFullYear(date: string) {
    // console.log(date)
    let year = new Date(date);
    return year.getFullYear();
  }

  builForm() {
    this.dateFromTo = this.formBuilder.group({
      dateRange: new FormGroup({
        start: new FormControl(),
        end: new FormControl(),
      }),
    });
    this.emailSend = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
    });
    this.refundSend = this.formBuilder.group({
      amount: ["", [Validators.required]],
    });
  }

  refundAmount() {
    this.disableRefundButton = true;
    this.sendedRefund = false;
    this.errorRefund = false;
    this.shTrSer
      .refundTransaction(
        this.refundSend.get("amount").value,
        this.currentTransaction.transactionId
      )
      .subscribe(
        (res) => {
          const body: any = res.body;
          if (body?.success === false) {
            this.errorRefund = true;
            this.disableRefundButton = false;
            this._snackBar.open(
              this.getApiErrorMessage(body, "Refund failed"),
              "",
              { duration: 7000 }
            );
            setTimeout(() => {
              this.errorRefund = false;
            }, 5000);
            return;
          }

          this.sendedRefund = true;
          this.disableRefundButton = false;
          this.refundSend.get("amount")?.reset();
          this.loadRefundHistory(this.currentTransaction.transactionId);
          this.getTransactionsFuction(this.curStatus, this.page);
          setTimeout(() => {
            this.sendedRefund = false;
          }, 5000);
        },
        (err) => {
          this.errorRefund = true;
          this.disableRefundButton = false;
          this._snackBar.open(
            this.getApiErrorMessage(err?.error, "Refund failed"),
            "",
            { duration: 7000 }
          );
          setTimeout(() => {
            this.errorRefund = false;
          }, 5000);
        }
      );
  }

  sendSMS() {
    this.disableEmailButton = true;
    this.sendedSms = false;
    this.errorSendMailSms = false;
    this.sms
      .sendSMSEmail(
        this.currentTransaction.hashOrderId,
        this.emailSend.get("email").value
      )
      .subscribe(
        (res) => {
          this.sendedSms = true;
          this.disableEmailButton = false;
          setTimeout(() => {
            this.sendedSms = false;
          }, 5000);
        },
        (err) => {
          this.errorSendMailSms = true;
          this.disableEmailButton = false;
          setTimeout(() => {
            this.errorSendMailSms = false;
          }, 5000);
        }
      );
  }

  handlePageEvent(e: PageEvent) {
    this.page = e.pageIndex + 1;
    this.goNextPreviousPage(this.page);
    // console.log('pageIndex', e.pageIndex)
    // console.log('previousPageIndex', e.previousPageIndex)
    // console.log('pageSize', e.pageSize)
    // console.log('length', e.length)
  }

  goNextPreviousPage(currPage) {
    const queryParams: Params = { page: `${currPage}` };
    this.router.navigate([], {
      queryParamsHandling: "merge",
      relativeTo: this.route,
      queryParams: queryParams,
    });
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

    this.dateFilters.start = this.toUtcMidnightIso(start);
    this.dateFilters.end = this.toUtcEndOfDayIso(end);
    this.preservePickerValues = true;
    this.filter();
  }

  /** Sends calendar date as UTC midnight, e.g. 2026-06-21 → 2026-06-21T00:00:00.000Z */
  private toUtcMidnightIso(date: Date): string {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    ).toISOString();
  }

  /** End of selected calendar day in UTC, e.g. 2026-06-26 → 2026-06-26T23:59:00.000Z */
  private toUtcEndOfDayIso(date: Date): string {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 0, 0)
    ).toISOString();
  }

  private buildDefaultApiDateFilters(): { start: string; end: string } {
    return {
      start: "2018-03-24T00:00:00.000Z",
      end: this.toUtcEndOfDayIso(new Date()),
    };
  }

  private clearDateRangeForm() {
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

  filter() {
    let queryParams = {};
    queryParams["start"] = this.dateFilters.start;
    queryParams["end"] = this.dateFilters.end;
    queryParams["page"] = 1;
    this.router.navigate([], {
      queryParamsHandling: "merge",
      relativeTo: this.route,
      queryParams: queryParams,
    });
    // this.closeModal.nativeElement.click()
  }

  resetDate() {
    this.preservePickerValues = false;
    Object.assign(this.dateFilters, this.buildDefaultApiDateFilters());
    this.clearDateRangeForm();
    this.router.navigate([], {
      queryParamsHandling: "merge",
      relativeTo: this.route,
      queryParams: { start: null, end: null, page: 1 },
    });
  }

  blockTransaction() {
    const transactionId = this.currentTransaction?.transactionId;
    if (!transactionId) {
      return;
    }

    this.shTrSer.blockTransaction(transactionId).subscribe(
      (res) => {
        const body: any = res.body;
        if (body?.success === false) {
          this._snackBar.open(
            body?.errorMessage || body?.errorCode || "Delete failed",
            "",
            { duration: 7000 }
          );
          return;
        }

        this.reverseModal.nativeElement.click();
        this.getTransactionsFuction(this.curStatus, this.page);
      },
      (err) => {
        const message =
          err?.error?.errorMessage ||
          err?.error?.message ||
          "Delete failed";
        this._snackBar.open(message, "", { duration: 7000 });
      }
    );
  }

  @HostListener("window:popstate", ["$event"])
  onPopState(event) {
    this.infoModal?.nativeElement?.click();
    this.reverseModal?.nativeElement?.click();
  }

  ngOnDestroy() {
    this.infoModal.nativeElement.click();
    this.reverseModal.nativeElement.click();
    this.dataExchange.unsubscribe();
    // this.merchantIdSubscription.unsubscribe()
  }
}

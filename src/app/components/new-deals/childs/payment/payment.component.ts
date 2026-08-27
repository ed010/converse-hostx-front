import {
  Component,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
} from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { ApplePayComponentResponse } from "src/app/models/apple-pay/ApplePayComponentResponse.model";
import { MerchantPaymentInfoModel } from "src/app/models/merchantInfoPayment.model";
import { readPayApiErrorMessage } from "src/app/models/payment-pay-response.model";
import { Transactions } from "src/app/models/transactions.model";
import { DataExchangeService } from "src/app/services/dataExchange.service";
import { PaymentService } from "src/app/services/payment.service";
import { SignalRService } from "src/app/services/signalR.service";
import { normalizeLanguageCode } from "src/app/utils/language.util";
import { resolvePaymentRedirectUrl } from "src/app/utils/payment-redirect.util";

@Component({
  selector: "app-payment",
  templateUrl: "./payment.component.html",
  styleUrls: ["./payment.component.scss"],
})
export class PaymentComponent implements OnInit, OnDestroy {
  showEmailField: boolean = false;
  transferId!: string;

  transaction!: Transactions;
  merchantInfo!: MerchantPaymentInfoModel;
  changedAmount!: string;
  amountError: boolean = false;

  newComment: string = "";

  isMainLoading: boolean = false;
  isSmallLoading: boolean = false;

  notary: boolean = false;

  getNotification: Subscription;

  showApplePayButton: boolean = false;

  onlyApplePay: boolean = false;
  canRedirectToURL: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private signalRService: SignalRService,
    private dataEx: DataExchangeService,
    private _snackBar: MatSnackBar,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap) => {
      this.transferId = paramMap.get("id");
      if (!this.transferId) {
        this.route.queryParamMap.subscribe({
          next: (queryParamMap) => {
            this.onlyApplePay = true;
            this.transferId = queryParamMap.get("pxNumber");
            this.canRedirectToURL = true;
          },
        });
      }

      this.getTransactionDetails(this.transferId);

      if (typeof ApplePaySession !== "undefined") {
        this.showApplePayButton = true;
      }
    });
  }

  getTransactionDetails(id: string) {
    this.isMainLoading = true;
    const merchantUserId =
      this.route.snapshot.queryParamMap.get("merchantUserId") || undefined;
    this.paymentService.getTransaction(id, merchantUserId).subscribe(
      (res) => {
        this.transaction = (res.body as any).transaction;
        this.merchantInfo = (res.body as any).merchantUser;
        if (this.merchantInfo.merchantInfo.companyNameHy.includes("նոտար")) {
          this.notary = true;
        }
        // this.signalRService.addData(
        //   this.merchantInfo.merchantUserId.toString()
        // );

        const lang = normalizeLanguageCode(this.transaction.language);
        localStorage.setItem("lang", lang);
        this.dataEx.setLanguage(lang);

        if (
          this.transaction.isBlocked ||
          this.transaction.transactionStatus == 3 ||
          this.transaction.transactionStatus == 4
        ) {
          this.router.navigateByUrl(`transaction-not-found/${id}`);
          return;
        }
        this.newComment = this.transaction.comment;
        this.getNotification = this.dataEx.getNotification().subscribe(
          (res) => {
            if (res["isPaid"] == "true") {
              window.location.href = `en/px_transfer?transfer_id=${res["transactionId"]}`;
            }
          },
          (err) => {
            let errmer = err.error.message;
            this._snackBar.open(errmer, "", {
              duration: 2000,
            });
          }
        );
        this.translateService.use(lang);
        if (this.transaction.transactionStatus == 2) {
          this.router.navigateByUrl(`transfer_success/${this.transferId}`);
          return;
        }
        this.isMainLoading = false;
      },
      (err) => {
        this.isMainLoading = false;
        this.router.navigateByUrl(`404`);
      }
    );
  }

  checkAmount() {
    console.log(typeof this.changedAmount);
  }

  payByCard() {
    this.isSmallLoading = true;
    if (this.transaction.amount == 0) {
      console.log(this.changedAmount);
      if (
        Number.parseInt(this.changedAmount) == 0 ||
        Number.parseInt(this.changedAmount) == undefined ||
        Number.isNaN(this.changedAmount) ||
        this.changedAmount == null
      ) {
        console.log("some error");
        this.amountError = true;
        this.isSmallLoading = false;
        return;
      }
      if (this.changedAmount.toString().length > 11) {
        this._snackBar.open(
          "Max amount will be less than 100,000,000,000",
          "",
          {
            duration: 7000,
          }
        );
        this.isSmallLoading = false;
        return;
      }
    }

    const amount =
      this.transaction.amount == 0
        ? Number.parseInt(this.changedAmount, 10)
        : this.transaction.amount;
    const payBody = {
      amount,
      transferId: Number(this.transaction.transactionId ?? 0),
      comment: this.newComment != null ? String(this.newComment) : "",
    };
    this.paymentService.pay(payBody).subscribe(
      (res) => {
        this.isSmallLoading = false;
        const body = res.body as any;
        const apiErr = readPayApiErrorMessage(body);
        if (apiErr) {
          this._snackBar.open(apiErr, "", { duration: 7000 });
          return;
        }
        const formUrl = body && body["formUrl"];
        const redirectUrl = resolvePaymentRedirectUrl(formUrl);
        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        }
        if (res.status === 200 || res.status === 201) {
          this.router.navigateByUrl(`transfer_success/${this.transferId}`);
          return;
        }
      },
      (err) => {
        this.isSmallLoading = false;
        const errmer =
          readPayApiErrorMessage(err?.error) ||
          err?.error?.message ||
          err?.message ||
          "";
        this._snackBar.open(errmer || "Payment failed", "", {
          duration: 7000,
        });
      }
    );
  }

  replaceConverseImgLink(originalUrl: string) {
    let domainPattern = /^(http:\/\/)([^\/]+)(.*)$/;
    let newUrl = originalUrl.replace(domainPattern, "$1pay.conversebank.am$3");
    return newUrl;
  }

  onApplePayCompleted(data: ApplePayComponentResponse) {
    console.log(data.status, data.redirect);
    if (data.status == "success") {
      if (data.redirect && data.redirect_url) {
        this.router.navigateByUrl(`transfer_success/${this.transferId}`);
      }
    } else if (data.status === "failure") {
      this.translateService.get("deals").subscribe((res) => {
        const errMessage = res.errorMessage1 || "Payment failed";
        this._snackBar.open(errMessage, "", {
          duration: 7000,
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.getNotification?.unsubscribe();
  }
}

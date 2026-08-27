import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { MerchantPaymentInfoModel } from "src/app/models/merchantInfoPayment.model";
import { ResponseScannedQr } from "src/app/models/responseScannedQr";
import { Transactions } from "src/app/models/transactions.model";
import { DataExchangeService } from "src/app/services/dataExchange.service";
import { PaymentService } from "src/app/services/payment.service";
import { normalizeLanguageCode } from "src/app/utils/language.util";

@Component({
  selector: "app-payment-faild",
  templateUrl: "./payment-failed.component.html",
  styleUrls: ["./payment-failed.component.scss"],
})
export class PaymentFailedComponent implements OnInit {
  showEmailField: boolean = false;
  transferId!: string;

  transaction!: Transactions;
  merchantInfo!: MerchantPaymentInfoModel;
  resScanBody!: ResponseScannedQr;

  changedAmount!: string;
  amountError: boolean = false;

  newComment: string = "";

  isMainLoading: boolean = false;
  isSmallLoading: boolean = false;

  notary: boolean = false;

  getNotification: Subscription;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private dataEx: DataExchangeService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap) => {
      this.transferId =
        paramMap.get("id") ||
        this.route.snapshot.queryParamMap.get("transactionId");
      if (!this.transferId) {
        return;
      }
      const merchantUserId =
        this.route.snapshot.queryParamMap.get("merchantUserId") || undefined;
      this.getTransactionDetails(this.transferId, merchantUserId);
    });
  }

  getTransactionDetails(id: string, merchantUserId?: string) {
    this.isMainLoading = true;
    this.paymentService.getTransaction(id, merchantUserId).subscribe(
      (res) => {
        this.transaction = (res.body as any).transaction;
        this.merchantInfo = (res.body as any).merchantUser;
        if (this.merchantInfo.merchantInfo.companyNameHy.includes("նոտար")) {
          this.notary = true;
        }

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

        this.translateService.use(lang);

        this.isMainLoading = false;
      },
      (err) => {
        this.isMainLoading = false;
      }
    );
  }

  onOkBtnClick() {
    this.router.navigateByUrl(`px_transfer/${this.transferId}`);
  }

  replaceConverseImgLink(originalUrl: string) {
    if (originalUrl.includes("https://pay.conversebank.am")) return originalUrl;
    let domainPattern = /^(http:\/\/)([^\/]+)(.*)$/;

    let newUrl = originalUrl.replace(
      domainPattern,
      "https://pay.conversebank.am$3"
    );
    return newUrl;
  }
}

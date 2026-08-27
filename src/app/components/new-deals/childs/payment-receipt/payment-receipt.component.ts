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
  selector: "app-payment-receipt",
  templateUrl: "./payment-receipt.component.html",
  styleUrls: ["./payment-receipt.component.scss"],
})
export class PaymentReceiptComponent implements OnInit {
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
      this.transferId = paramMap.get("id");
      if (!this.transferId) {
      }
      this.getTransactionDetails(this.transferId);
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
        if (this.transaction.transactionStatus == 0)
          this.router.navigateByUrl(`px_transfer/${this.transferId}`);
        this.translateService.use(lang);

        this.isMainLoading = false;
      },
      (err) => {
        this.isMainLoading = false;
      }
    );
  }

  replaceConverseImgLink(originalUrl: string) {
    let domainPattern = /^(http:\/\/)([^\/]+)(.*)$/;
    let newUrl = originalUrl.replace(domainPattern, "$1pay.conversebank.am$3");
    return newUrl;
  }
}

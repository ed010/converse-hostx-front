import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Merchant } from "src/app/models/merchant.model";
import { SMSHistory } from "src/app/models/smsHistory.model";
import { MerchantService } from "src/app/services/merchant.service";
import { SmsService } from "src/app/services/sms.service";

type SmsView = "merchants" | "history";

@Component({
  selector: "app-sms",
  templateUrl: "./sms.component.html",
  styleUrls: ["./sms.component.scss"],
})
export class SmsComponent implements OnInit {
  view: SmsView = "merchants";
  showLoader = false;

  merchants: Merchant[] = [];
  merchantPage = 1;
  merchantPageSize = 30;
  disableMerchantNext = false;
  merchantSearch = {
    merchantId: "",
    companyNameEn: "",
  };

  selectedMerchant: Merchant = null;
  history: SMSHistory[] = [];
  smsPage = 1;
  smsCount = 50;
  smsTotalCount = 0;

  constructor(
    private smsService: SmsService,
    private merchantService: MerchantService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMerchants();
  }

  get smsTotalPages(): number {
    return Math.max(1, Math.ceil(this.smsTotalCount / this.smsCount) || 1);
  }

  get disableSmsNext(): boolean {
    return this.smsPage >= this.smsTotalPages || this.history.length < this.smsCount;
  }

  merchantName(m: Merchant): string {
    return (
      m?.merchantInfo?.companyNameEn ||
      m?.merchantInfo?.companyNameHy ||
      m?.merchantInfo?.legalCompanyName ||
      "—"
    );
  }

  loadMerchants(): void {
    this.showLoader = true;
    const body = {
      merchantId: this.merchantSearch.merchantId || null,
      companyNameEn: this.merchantSearch.companyNameEn || null,
      status: "1",
    };

    this.merchantService
      .getMerhcnatFiltersByPage(
        this.merchantPage,
        this.merchantPageSize,
        body
      )
      .subscribe(
        (res) => {
          this.merchants = (res.body as Merchant[]) || [];
          this.disableMerchantNext =
            this.merchants.length < this.merchantPageSize;
          this.showLoader = false;
        },
        (err) => this.handleError(err)
      );
  }

  applyMerchantFilter(): void {
    this.merchantPage = 1;
    this.loadMerchants();
  }

  clearMerchantFilter(): void {
    this.merchantSearch = { merchantId: "", companyNameEn: "" };
    this.merchantPage = 1;
    this.loadMerchants();
  }

  goMerchantPage(delta: number): void {
    const next = this.merchantPage + delta;
    if (next < 1) {
      return;
    }
    if (delta > 0 && this.disableMerchantNext) {
      return;
    }
    this.merchantPage = next;
    this.loadMerchants();
  }

  openMerchantSms(merchant: Merchant): void {
    this.selectedMerchant = merchant;
    this.view = "history";
    this.smsPage = 1;
    this.loadSmsHistory();
  }

  backToMerchants(): void {
    this.view = "merchants";
    this.selectedMerchant = null;
    this.history = [];
    this.smsTotalCount = 0;
  }

  loadSmsHistory(): void {
    if (!this.selectedMerchant?.merchantId) {
      return;
    }
    this.showLoader = true;
    this.smsService
      .getSMShistory({
        merchantId: this.selectedMerchant.merchantId,
        page: this.smsPage,
        count: this.smsCount,
      })
      .subscribe(
        (res) => {
          this.history = res?.items || [];
          this.smsTotalCount = res?.count || 0;
          this.showLoader = false;
        },
        (err) => this.handleError(err)
      );
  }

  goSmsPage(delta: number): void {
    const next = this.smsPage + delta;
    if (next < 1) {
      return;
    }
    if (delta > 0 && this.disableSmsNext) {
      return;
    }
    this.smsPage = next;
    this.loadSmsHistory();
  }

  private handleError(err: any): void {
    this.showLoader = false;
    const message =
      err?.error?.errorMessage ||
      err?.error?.message ||
      err?.message ||
      "Request failed";
    this.snackBar.open(message, "", { duration: 7000 });
  }
}

import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { MerchantIdTitle } from "src/app/models/merchantIdTitle";
import { Qr } from "src/app/models/qr";
import { SmsModel } from "src/app/models/sms";
import { DataExchangeService } from "src/app/services/dataExchange.service";
import { GetMerchantForUserService } from "src/app/services/getMerchantForUser.service";
import { QrGeneratorService } from "src/app/services/qrGenerator.service";
import { SignalRService } from "src/app/services/signalR.service";
// import { SignalRService } from "src/app/services/signalR.service";
import { SmsService } from "src/app/services/sms.service";
import { COUNTRY_LIST } from "src/app/enums/countries";

type Country = (typeof COUNTRY_LIST)[number];

@Component({
  selector: "app-qe-generator",
  templateUrl: "./qe-generator.component.html",
  styleUrls: ["./qe-generator.component.css"],
})
export class QeGeneratorComponent implements OnInit, OnDestroy {
  qrCode: string;
  loading: boolean;
  showQr: boolean = false;
  merchant: MerchantIdTitle[];
  selectedMerchantId: number;
  selectedMerchantIdSubscription: Subscription;
  getNotification: Subscription;
  isChecked: boolean = false;
  copied: boolean = false;
  transactionID: number;
  amountValue: number;
  canGenerateMultiQR: boolean = false;
  canGenerateQR: boolean = false;
  phoneNumber: string;
  a: number;
  sendSmsButton: boolean = true;
  commentValue: string;
  link: string;
  invalidPhoneNumber: boolean = false;
  successPhone: boolean = false;
  showSuccessMessage = false;
  sginalRMerchantId: string;
  qrForm: FormGroup;
  message: any;

  currencies: string[];

  canChangeComments: boolean = false;
  changedComment: boolean = false;

  // Armenia pinned first, the rest alphabetical.
  readonly countries: Country[] = [
    ...COUNTRY_LIST.filter((c) => c.code === "AM"),
    ...COUNTRY_LIST.filter((c) => c.code !== "AM").sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
  ];
  private readonly defaultCountry = this.countries[0];
  selectedCountry: Country = this.defaultCountry;
  countrySearchText = "";
  countryDropdownOpen = false;
  @ViewChild("countryDropdown") countryDropdown: ElementRef<HTMLElement>;
  // Valid Armenian mobile prefixes (same whitelist as legacy PayX).
  private readonly phonePrefixes = [
    "91", "93", "94", "95", "96", "97", "98", "99",
    "77", "55", "41", "42", "43", "44", "33",
  ];


  @ViewChild("closeModal") closeModal: ElementRef;
  @ViewChild("close_modal_qr") close_modal_qr: ElementRef;
  @ViewChild("qr_modal") qr_modal: ElementRef;
  @ViewChild("closeQrLink") closeQrLink: ElementRef;
  @ViewChild("closePayxUserModal") closePayxUserModal: ElementRef;

  constructor(
    private qrService: QrGeneratorService,
    private dataEx: DataExchangeService,
    private getMerFUser: GetMerchantForUserService,
    private formBuilder: FormBuilder,
    private router: Router,
    private SMSservice: SmsService,
    private _snackBar: MatSnackBar,
    private signalRService: SignalRService
  ) {}

  ngOnInit(): void {
    this.getNotification = this.dataEx.getNotification().subscribe(
      (res) => {
        console.log("qr res", res);
        if (res["isPaid"] == "true") {
          this.close_modal_qr.nativeElement.click();
          this.closeQrLink.nativeElement.click();
          this.showSuccessMessage = true;
          this.showQr = false;
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 4000);
        }
      },
      (err) => {
        let errmer = err.error?.message;
        this._snackBar.open(errmer, "", {
          duration: 2000,
        });
      }
    );
    // this.message = this.messagingService.currentMessage
    this.qrForm = this.formBuilder.group({
      currency: [null],
      amount: [0, [Validators.required]],
      comment: [""],
      isMulti: [""],
      canChangeComment: [false],
    });
    this.selectedMerchantIdSubscription = this.dataEx
      .getMerId()
      .subscribe((res) => {
        this.retunrMerchantID(res);
      });
    const get_id_promise = new Promise((reslove, reject) => {
      let id = localStorage.getItem("id");
      reslove(id);
    });
    get_id_promise.then((data) => {
      this.getMerFUser.getMerchantUser(data).subscribe((res) => {
        this.merchant = res.merchants;
        this.canGenerateMultiQR = res.canGenerateMultiQR;
        this.canGenerateQR = res.canGenerateQR;
        this.sginalRMerchantId = res.merchantUserId;
        this.canChangeComments = res.canChangeComment;
        this.applyCanChangeCommentPermission();
        this.currencies = res.currencies;
        if (this.currencies?.length) {
          this.qrForm.get("currency").setValue(this.currencies[0]);
        }
      });
    });
    // this.dataEx.getMerId().subscribe(
    //   res => {
    //     this.selectedMerchantId = res;
    //     console.log(res)
    //   }
    // )
    this.selectedMerchantId = this.dataEx.retId();
  }

  getCurrencySuffix(): string {
    const currency = this.qrForm.get('currency')?.value || '';
    const currencySymbols: { [key: string]: string } = {
      'AMD': '֏',
      'USD': '$',
      'EUR': '€',
      'RUB': '₽'
    };
    return ' ' + (currencySymbols[currency] || currency);
  }

  dissmiss() {
    this.showQr = false;
    this.qrCode = "";
    this.copied = false;
  }
  generateQR() {
    // if (this.qrForm.get("amount").value == 0) {
    //   return;
    // }
    this.sendSmsButton = false;
    this.invalidPhoneNumber = false;
    this.successPhone = false;
    this.sendSmsButton = true;
    this.phoneNumber = undefined;
    this.loading = true;
    this.amountValue = this.qrForm.get("amount").value;
    this.qrForm.get("amount").value;
    this.commentValue =
      this.qrForm.get("comment").value == "" ||
      this.qrForm.get("comment").value == null
        ? ""
        : this.qrForm.get("comment").value;
    let qr: Qr = {
      merchantId: this.selectedMerchantId * 1,
      amount: this.amountValue * 1,
      comment: this.commentValue,
      currency: this.qrForm.get("currency").value,
      // isMulti: this.qrForm.get("isMulti").value == 1 ? true : false,
      isMulti: this.canGenerateMultiQR
        ? this.qrForm.get("isMulti").value == 1
          ? true
          : false
        : false,
      canChangeComment: this.canChangeComments ? this.changedComment : false,
    };
    this.signalRService.addData(this.sginalRMerchantId?.toString());
    this.qrService.getQr(qr).subscribe(
      (res) => {
        // this.qr_modal.nativeElement.click()

        this.qrCode = res.body["code"];
        this.link = res.body["payXUrl"];
        this.transactionID = res.body["id"];
        this.loading = false;
        this.qrForm.get("amount").setValue(0);
        this.qrForm.get("comment").reset();
      },
      (err) => {
        this.loading = false;
        const body = err?.error;
        const errmer =
          (typeof body === "string" ? body : null) ??
          body?.errorMessage ??
          body?.message ??
          err?.message ??
          "Request failed";
        this._snackBar.open(String(errmer), "", {
          duration: 5000,
        });
        this.showQr = true;
        setTimeout(() => {
          this.close_modal_qr.nativeElement.click();
        }, 1000);
      }
    );
    this.showQr = true;
    this.qr_modal.nativeElement.click();

    // } else {
    //   this._snackBar.open('The amount field should not be empty or 0','', {
    //     duration: 2000
    //   });
    // }
  }
  amDisable(e) {
    this.isChecked = e.target.checked;
    // if (this.isChecked) {
    //   // this.qrForm.get("amount").disable();
    //   // this.qrForm.get('amount').setValue(0)
    // } else this.qrForm.get("amount").enable();
  }
  private applyCanChangeCommentPermission(): void {
    const control = this.qrForm.get("canChangeComment");
    if (!control) {
      return;
    }
    if (this.canChangeComments) {
      control.enable({ emitEvent: false });
    } else {
      this.changedComment = false;
      control.setValue(false, { emitEvent: false });
      control.disable({ emitEvent: false });
    }
  }

  changeCommentStatus(e) {
    if (!this.canChangeComments) {
      this.changedComment = false;
      return;
    }
    this.changedComment = e.target.checked;
  }
  retunrMerchantID(id: number) {
    this.selectedMerchantId = id;
    return this.selectedMerchantId;
  }
  openSmsModal() {
    this.phoneNumber = undefined;
    this.invalidPhoneNumber = false;
    this.successPhone = false;
    this.sendSmsButton = true;
    this.selectedCountry = this.defaultCountry;
    this.countrySearchText = "";
    this.countryDropdownOpen = false;
  }

  get filteredCountries(): Country[] {
    const search = this.countrySearchText.trim().toLowerCase();
    if (!search) {
      return this.countries;
    }
    const digits = search.replace(/\D/g, "");
    return this.countries.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        (digits && c.dialCode.slice(1).startsWith(digits))
    );
  }

  // Toggled in Angular: Bootstrap 5's dropdown JS needs Popper v2, but only popper.js v1 is loaded.
  @HostListener("document:click", ["$event"])
  closeCountryDropdownOnOutsideClick(event: MouseEvent) {
    if (
      this.countryDropdownOpen &&
      !this.countryDropdown?.nativeElement.contains(event.target as Node)
    ) {
      this.countryDropdownOpen = false;
    }
  }

  selectCountry(country: Country) {
    this.selectedCountry = country;
    this.countryDropdownOpen = false;
    this.phoneNumber = undefined;
    this.invalidPhoneNumber = false;
  }

  get phoneMask(): string {
    return this.selectedCountry.mask;
  }

  // flag-icons has no sub-region flags (e.g. "TZ-Z"), so fall back to the country.
  flagClass(country: Country): string {
    return "fi fi-" + country.code.slice(0, 2).toLowerCase();
  }

  copyLink() {
    navigator.clipboard.writeText(this.link)
      ? (this.copied = true)
      : (this.copied = false);
    setTimeout(() => {
      this.copied = false;
    }, 2500);
  }

  copyToClipboard(link: string) {
    if (link) {
      // Create new element
      let el = document.createElement("textarea");
      // Set value (string to be copied)
      el.value = link;
      // Set non-editable to avoid focus and move outside of view
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      // Select text inside element
      el.select();
      // Copy text to clipboard
      document.execCommand("copy");
      // Remove temporary element
      document.body.removeChild(el);
      return true;
    } else return false;
  }

  sendSMS() {
    this.sendSmsButton = false;
    this.invalidPhoneNumber = false;
    this.successPhone = false;

    // Drop a leading trunk "0" typed out of local habit (e.g. AU 0412..., AM 091...).
    const cleanPhone = (this.phoneNumber || "")
      .replace(/\D/g, "")
      .replace(/^0+/, "");
    const isArmenia = this.selectedCountry.code === "AM";
    // Armenia: 8 digits with a known operator prefix. Others: the country masks are
    // approximate (some count the trunk 0), so only enforce E.164 bounds: 6+ national
    // digits and at most 15 digits including the dial code.
    const totalDigits =
      this.selectedCountry.dialCode.replace(/\D/g, "").length + cleanPhone.length;
    const valid = isArmenia
      ? cleanPhone.length === 8 &&
        this.phonePrefixes.includes(cleanPhone.slice(0, 2))
      : cleanPhone.length >= 6 && totalDigits <= 15;
    if (!valid) {
      this.invalidPhoneNumber = true;
      this.sendSmsButton = true;
      return;
    }

    let body: SmsModel = {
      merchantId: this.selectedMerchantId,
      transactionId: String(this.transactionID),
      phone: this.selectedCountry.dialCode + cleanPhone,
    };

    this.SMSservice.sendSMS(body).subscribe(
      (res) => {
        this.successPhone = true;
        setTimeout(() => {
          this.closeModal.nativeElement.click();
          this.close_modal_qr.nativeElement.click();
          this.closeQrLink.nativeElement.click();
        }, 2000);
      },
      (err) => {
        this.sendSmsButton = true;
        this.invalidPhoneNumber = true;
      }
    );
  }
  valueChange(e) {
    this.phoneNumber;
  }


  sendPayxUSer() {}

  ngOnDestroy() {
    this.closeModal?.nativeElement?.click();
    this.close_modal_qr?.nativeElement?.click();

    this.selectedMerchantIdSubscription.unsubscribe();

    this.selectedMerchantIdSubscription.unsubscribe();
    this.getNotification.unsubscribe();
  }
}

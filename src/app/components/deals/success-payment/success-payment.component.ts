import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { switchMap } from "rxjs/operators";
import { Transactions } from "src/app/models/transactions.model";
import { PaymentService } from "src/app/services/payment.service";
import { SmsService } from "src/app/services/sms.service";

@Component({
  selector: "app-success-payment",
  templateUrl: "./success-payment.component.html",
  styleUrls: ["./success-payment.component.css"],
})
export class SuccessPaymentComponent implements OnInit {
  successTransferId: number;
  transaction: Transactions;
  sendMail: FormGroup;
  showLoader: boolean = false;
  showLoaderBig: boolean = false;
  showTick: boolean = false;
  // ImgUrl = ``;

  constructor(
    private aRoute: ActivatedRoute,
    private paymentService: PaymentService,
    private router: Router,
    private formBuilder: FormBuilder,
    private smsServie: SmsService,
    private _snackBar: MatSnackBar // private domSanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.aRoute.paramMap
      .pipe(switchMap((params) => params.getAll("id")))
      .subscribe((res) => {
        this.showLoaderBig = true;
        this.buildForm();
        const hash = Array.isArray(res) ? res[0] : res;
        this.successTransferId = parseInt(hash, 10);
        const merchantUserId =
          this.aRoute.snapshot.queryParamMap.get("merchantUserId") || undefined;
        this.paymentService.getTransaction(hash, merchantUserId).subscribe(
          (res) => {
            this.showLoaderBig = false;

            this.transaction = res.body["transaction"] as Transactions;
            // this.ImgUrl = `data:image/png;base64, ${this.domSanitizer.bypassSecurityTrustUrl(this.transaction['qrImage'])}`
            if (this.transaction.transactionStatus == 0)
              this.router.navigateByUrl(
                `px_transfer/${this.successTransferId}`
              );
          },
          (err) => {
            this.showLoaderBig = false;
            let errmer = err.error.message;
            this._snackBar.open(errmer, "", {
              duration: 2000,
            });
          }
        );
      });
  }

  buildForm() {
    this.sendMail = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
    });
  }
  sendData() {
    this.showLoader = true;
    this.showTick = false;
    this.smsServie
      .sendSMSEmail(
        this.transaction.hashOrderId,
        this.sendMail.get("email").value
      )
      .subscribe(
        (res) => {
          this.showLoader = false;
          this.showTick = true;
          setTimeout(() => {
            this.showTick = false;
          }, 4000);
          this.sendMail.get("email").reset();
        },
        (err) => {
          this.showLoader = false;
        }
      );
  }

  replaceConverseImgLink(originalUrl: string) {
    let domainPattern = /^(http:\/\/)([^\/]+)(.*)$/;
    let newUrl = originalUrl.replace(domainPattern, "$1pay.conversebank.am$3");
    return newUrl;
  }
}

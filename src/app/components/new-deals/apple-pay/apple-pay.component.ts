import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ApplePayComponentResponse } from "src/app/models/apple-pay/ApplePayComponentResponse.model";
import { ProcessApplePay } from "src/app/models/apple-pay/ProcessApplePay.model";
import { ApplePayService } from "src/app/services/applePay.service";
import { resolvePaymentRedirectUrl } from "src/app/utils/payment-redirect.util";

interface ApplePaySessionRequest {
  countryCode: string;
  currencyCode: string;
  merchantCapabilities: ["supports3DS"];
  supportedNetworks: ["visa", "masterCard"];
  total: {
    label: string;
    type: "final";
    amount: string;
  };
}

@Component({
  selector: "app-apple-pay",
  templateUrl: "./apple-pay.component.html",
  styleUrls: ["./apple-pay.component.css"],
})
export class ApplePayComponent implements OnInit {
  @Input() merchantId!: number;
  @Input() transactionHash!: string;
  @Input() currency!: string;
  @Input() transactionAmount!: string;
  @Input() transactionComment!: string;
  @Input() canRedirectToURL!: boolean;

  @Output() onApplePayCompleted = new EventEmitter<ApplePayComponentResponse>();

  constructor(private applePayService: ApplePayService) {}

  ngOnInit(): void {
    // location.reload();
  }

  applePayClicked() {
    if (!ApplePaySession) {
      alert("Apple Pay is not supported on this device/browser.");
      return;
    }

    const request: ApplePaySessionRequest = {
      countryCode: "AM",
      currencyCode: this.currency,
      merchantCapabilities: ["supports3DS"],
      supportedNetworks: ["visa", "masterCard"],
      total: {
        label: this.transactionComment,
        type: "final",
        amount: this.transactionAmount,
      },
    };

    const session = new ApplePaySession(3, request);

    session.onvalidatemerchant = async (event: any) => {
      this.validateMerchant(this.merchantId.toString())
        .then((merchantSession) => {
          session.completeMerchantValidation(merchantSession);
        })
        .catch((err) => {
          this.onApplePayCompleted.emit({
            status: "failure",
            redirect: false,
            redirect_url: null,
          });
        });
    };

    session.onpaymentauthorized = (event) => {
      let payload: any = event.payment.token;
      payload.transactionHash = this.transactionHash;
      this.processApplePayTransaction(payload)
        .then((res) => {
          let result: any;
          if (res.status == "Failed") {
            result = {
              status: ApplePaySession.STATUS_FAILURE,
            };
          } else {
            result = {
              status: ApplePaySession.STATUS_SUCCESS,
            };
          }

          session.completePayment(result);

          if (this.canRedirectToURL) {
            const redirectUrl = resolvePaymentRedirectUrl(res.redirectUrl);
            if (redirectUrl) {
              location.href = redirectUrl;
            }
            // return;
          } else {
            if (res.status == "Failed") {
              location.href = `/400?transactionId=${this.transactionHash}`;
            } else location.reload();
          }
          // this.onApplePayCompleted.emit({
          //   status: "success",
          //   redirect: true,
          //   redirect_url: "transfer_success",
          // });
        })
        .catch((err) => {
          const result = {
            status: ApplePaySession.STATUS_FAILURE,
          };
          session.completePayment(result);
          // if (this.canRedirectToURL) {
          //   location.href = err?.error?.redirectUrl ?? null;
          //   return;
          // } else
          location.href = `/400?transactionId=${this.transactionHash}`;
          // location.reload();
          // this.onApplePayCompleted.emit({
          //   status: "failure",
          //   redirect: false,
          //   redirect_url: null,
          // });
        });
    };

    session.oncancel = (event: any) => {};

    session.begin();
  }

  private validateMerchant(merchantIdentifier: string) {
    return this.applePayService
      .validateMerchant(merchantIdentifier)
      .toPromise();
  }

  private processApplePayTransaction(data: any) {
    return this.applePayService.processApplePayTransaction(data).toPromise();
  }
}

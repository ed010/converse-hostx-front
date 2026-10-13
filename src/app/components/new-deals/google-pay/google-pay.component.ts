import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import {
  GooglePayConfig,
  ProcessGooglePayResponse,
} from "src/app/models/google-pay/google-pay.model";
import { GooglePayService } from "src/app/services/googlePay.service";
import { resolvePaymentRedirectUrl } from "src/app/utils/payment-redirect.util";

const BASE_REQUEST = { apiVersion: 2, apiVersionMinor: 0 };

/**
 * Google Pay button. Renders nothing (and emits availabilityChange(false)) unless the backend says the
 * transaction can be paid with Google Pay AND Google says this browser can pay. The token goes to
 * ProcessGooglePayTransaction while the sheet is still open, so a decline is shown in the sheet and
 * the payer can pick another card. On the HostX wallet page (canRedirectToURL) a payer who gives up after a
 * decline is sent to the partner's returnUrl when the sheet closes, the same as after a payment.
 */
@Component({
  selector: "app-google-pay",
  templateUrl: "./google-pay.component.html",
  styleUrls: ["./google-pay.component.css"],
})
export class GooglePayComponent implements OnInit {
  @Input() transactionHash!: string;
  @Input() canRedirectToURL!: boolean;

  @Output() availabilityChange = new EventEmitter<boolean>();

  @ViewChild("buttonContainer", { static: true })
  buttonContainer!: ElementRef<HTMLDivElement>;

  private config!: GooglePayConfig;
  private paymentsClient!: google.payments.api.PaymentsClient;
  /** Result of the payment authorized in the sheet, acted on once the sheet closes. */
  private result: ProcessGooglePayResponse | null = null;
  /** Partner returnUrl of the last declined attempt (wallet page only), followed if the payer closes the sheet. */
  private failedRedirectUrl: string | null = null;

  constructor(
    private googlePayService: GooglePayService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.init().catch(() => this.availabilityChange.emit(false));
  }

  private async init() {
    this.config = await this.googlePayService
      .getConfig(this.transactionHash)
      .toPromise();
    if (!this.config?.available) {
      this.availabilityChange.emit(false);
      return;
    }

    await this.googlePayService.loadScript();
    this.paymentsClient = new google.payments.api.PaymentsClient({
      environment: this.config.environment,
      paymentDataCallbacks: {
        onPaymentAuthorized: (paymentData) => this.onPaymentAuthorized(paymentData),
      },
    });

    const ready = await this.paymentsClient.isReadyToPay({
      ...BASE_REQUEST,
      allowedPaymentMethods: [this.baseCardPaymentMethod()],
    });
    if (!ready?.result) {
      this.availabilityChange.emit(false);
      return;
    }

    const button = this.paymentsClient.createButton({
      onClick: () => this.onGooglePayClicked(),
      allowedPaymentMethods: [this.cardPaymentMethod()],
      buttonColor: "black",
      buttonType: "pay",
      buttonSizeMode: "fill",
      buttonLocale: "en",
    });
    this.buttonContainer.nativeElement.appendChild(button);
    this.availabilityChange.emit(true);
  }

  /** Must call loadPaymentData synchronously, so the click still counts as a user gesture. */
  private onGooglePayClicked() {
    this.result = null;
    this.failedRedirectUrl = null;
    this.paymentsClient
      .loadPaymentData({
        ...BASE_REQUEST,
        allowedPaymentMethods: [this.cardPaymentMethod()],
        merchantInfo: {
          merchantId: this.config.merchantId || undefined,
          merchantName: this.config.merchantName,
        },
        transactionInfo: {
          totalPriceStatus: "FINAL",
          totalPrice: this.config.totalPrice,
          currencyCode: this.config.currencyCode,
          countryCode: this.config.countryCode,
        },
        callbackIntents: ["PAYMENT_AUTHORIZATION"],
      })
      .then(() => this.afterSheetClosed())
      // Rejected when the payer closes the sheet (statusCode CANCELED): stay on the page, unless a payment was
      // declined on the wallet page, which then goes back to the partner like a paid one.
      .catch(() => {
        if (this.failedRedirectUrl) {
          location.href = this.failedRedirectUrl;
        }
      });
  }

  private async onPaymentAuthorized(
    paymentData: google.payments.api.PaymentData
  ): Promise<google.payments.api.PaymentAuthorizationResult> {
    try {
      const res = await this.googlePayService
        .processGooglePayTransaction({
          transactionHash: this.transactionHash,
          paymentToken: paymentData.paymentMethodData.tokenizationData.token,
        })
        .toPromise();
      if (res?.status === "Success" || res?.status === "Redirect") {
        this.result = res;
        return { transactionState: "SUCCESS" };
      }
      if (this.canRedirectToURL) {
        this.failedRedirectUrl = resolvePaymentRedirectUrl(res?.redirectUrl);
      }
    } catch {
      // Handled below like a decline.
    }
    return {
      transactionState: "ERROR",
      error: {
        intent: "PAYMENT_AUTHORIZATION",
        reason: "PAYMENT_DATA_INVALID",
        message: this.translateService.instant("deals.GOOGLE_PAY_FAILED"),
      },
    };
  }

  private afterSheetClosed() {
    const res = this.result;
    if (!res) {
      return;
    }
    if (res.status === "Redirect" && res.redirectUrl) {
      // 3-D Secure on EPG; EPG sends the payer back through CheckStatus to the receipt / ReturnUrl.
      location.href = res.redirectUrl;
      return;
    }
    if (this.canRedirectToURL) {
      const redirectUrl = resolvePaymentRedirectUrl(res.redirectUrl);
      if (redirectUrl) {
        location.href = redirectUrl;
        return;
      }
    }
    // Receipt of the transaction actually paid: a multi QR is paid through a new child transaction.
    location.href = `/transfer_success/${res.hashOrderId || this.transactionHash}`;
  }

  private baseCardPaymentMethod(): google.payments.api.PaymentMethod {
    return {
      type: "CARD",
      parameters: {
        allowedAuthMethods: this.config.allowedAuthMethods,
        allowedCardNetworks: this.config.allowedCardNetworks,
      },
    };
  }

  private cardPaymentMethod(): google.payments.api.PaymentMethod {
    return {
      ...this.baseCardPaymentMethod(),
      tokenizationSpecification: {
        type: "PAYMENT_GATEWAY",
        parameters: {
          gateway: this.config.gateway,
          gatewayMerchantId: this.config.gatewayMerchantId,
        },
      },
    };
  }
}

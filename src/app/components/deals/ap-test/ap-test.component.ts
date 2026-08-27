import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-ap-test",
  templateUrl: "./ap-test.component.html",
  styleUrls: ["./ap-test.component.css"],
})
export class ApTestComponent implements OnInit {
  merchantIdentifier!: string;

  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((res) => {
      this.merchantIdentifier = res.id as string;
      console.log(this.merchantIdentifier ? this.merchantIdentifier : "945");
    });
  }

  applePayClicked() {
    if (!ApplePaySession) {
      alert("Apple pay not supported");
      return;
    }

    // Define ApplePayPaymentRequest
    const request = {
      countryCode: "AM",
      currencyCode: "AMD",
      merchantCapabilities: ["supports3DS"],
      supportedNetworks: ["visa", "masterCard"],
      total: {
        label: "Demo (Card is not charged)",
        type: "final",
        amount: "19.00",
      },
    };
    // Create ApplePaySession
    const session = new ApplePaySession(3, request);
    this.documentWrite("SESSION CREATED, new ApplePaySession(3, request);");

    session.onvalidatemerchant = async (event: any) => {
      // Call your own server to request a new merchant session.
      // const merchantSession = await validateMerchant();

      this.documentWrite(
        `onvalidatemerchant, and event data -> ${event.validationURL}`
      );
      console.log(event.validationURL);

      this.validateMerchant(
        this.merchantIdentifier ? this.merchantIdentifier.toString() : "945"
      ).then((data) => {
        const merchantSession = data;
        this.documentWrite(
          `FROM BACK END -> ${JSON.stringify(merchantSession)}`
        );
        console.log("FROM BACK END -> merchant session: ", merchantSession);
        session.completeMerchantValidation(merchantSession);
      });
    };

    session.onpaymentmethodselected = (event) => {
      this.documentWrite(
        `onpaymentmethodselected, and event data -> ${JSON.stringify(event)}`
      );
      console.log("onpaymentmethodselected, and event data -> ", event);
      const update = {
        newTotal: {
          label: "Demo (Card is not charged)",
          amount: "19.00",
          type: "final",
        },
      };
      session.completePaymentMethodSelection(update);
    };

    session.onshippingmethodselected = (event) => {
      // Define ApplePayShippingMethodUpdate based on the selected shipping method.
      // No updates or errors are needed, pass an empty object.
      this.documentWrite(
        `onshippingmethodselected, event data -> ${JSON.stringify(event)}`
      );
      console.log("onshippingmethodselected, event data ->", event);

      const update = {};
      session.completeShippingMethodSelection(update);
    };

    session.onshippingcontactselected = (event) => {
      // Define ApplePayShippingContactUpdate based on the selected shipping contact.
      this.documentWrite(
        `onshippingcontactselected, event data -> ${JSON.stringify(event)}`
      );
      console.log("onshippingcontactselected, event data ->", event);

      const update = {};
      session.completeShippingContactSelection(update);
    };

    session.onpaymentauthorized = (event) => {
      // Define ApplePayPaymentAuthorizationResult
      this.documentWrite(
        `onpaymentauthorized, event data-> PAYMENT: ${JSON.stringify(
          (event as any)?.payment
        )}`
      );
      this.documentWrite(
        `onpaymentauthorized, event data-> PAYMENT TOKEN: ${JSON.stringify(
          (event as any).payment?.token
        )}`
      );
      console.log("onpaymentauthorized, event data->", event);
      console.log("onpaymentauthorized, event data-> PAYMENT: ", event.payment);
      console.log(
        "onpaymentauthorized, event data-> PAYMENT TOKEN: ",
        event.payment.token
      );

      const result = {
        status: ApplePaySession.STATUS_SUCCESS,
      };
      session.completePayment(result);
    };

    session.oncancel = (event: any) => {
      // Payment cancelled by WebKit
      this.documentWrite(`oncancel`);
    };

    session.begin();
  }

  private async validateMerchant(merchantIdentifier: string): Promise<any> {
    const merchantSessionPromise = new Promise((resolve, reject) => {
      this.http
        .post(
          "/api/Payment/GetSessionToken",
          { merchantIdentifier },
          { observe: "response" }
        )
        .subscribe(
          (res) => {
            let merchantSession = res.body;
            // alert(JSON.stringify(merchantSession))
            resolve(merchantSession);
          },
          (err) => {
            this.documentWrite("api/Payment/GetSessionToken error");
          }
        );
    });
    return merchantSessionPromise;
  }

  documentWrite(data: any) {
    let d = JSON.stringify(data);
    let p = document.createElement("p");
    p.innerText = d;
    document.getElementById("content").appendChild(p);
  }
}

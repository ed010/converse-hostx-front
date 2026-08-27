import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Card } from 'src/app/models/payx/card.model';
import { readPayApiErrorMessage } from 'src/app/models/payment-pay-response.model';
import { Transactions } from 'src/app/models/transactions.model';
import { AuthService } from 'src/app/services/auth.service';
import { PaymentService } from 'src/app/services/payment.service';
import { UserService } from 'src/app/services/payx/user.service';
import { DomSanitizer } from '@angular/platform-browser';
import { GetMerchantForUserService } from 'src/app/services/getMerchantForUser.service';
import { TranslateService } from '@ngx-translate/core';
import { DataExchangeService } from 'src/app/services/dataExchange.service';
import { SignalRService } from 'src/app/services/signalR.service';
import { normalizeLanguageCode } from 'src/app/utils/language.util';
import { resolvePaymentRedirectUrl } from 'src/app/utils/payment-redirect.util';
import { saveAs } from "file-saver";
import QRCode from 'qrcode'
import { ApplePayService } from 'src/app/services/applePay.service';



@Component({
  selector: 'app-make-payment',
  templateUrl: './make-payment.component.html',
  styleUrls: ['./make-payment.component.css']
})
export class MakePaymentComponent implements OnInit {
  transferID: string;
  transaction: Transactions;
  qrValue: string;
  linkFromResponse: string;
  changeValue: boolean = false;
  amount: number;
  amountNgOnInit: number;
  showLoader: boolean = false;
  isMulti: boolean;
  cards: Card[] = [];
  selectedCardId: number = -1;
  canGenerateQR: boolean = false
  isPayxUser: boolean = false
  getNotification: Subscription;
  notary:boolean = false


  amountError: boolean = false
  ImgUrl = ``;

  newComment: string = ""
  changeComment: boolean = false;


  @ViewChild('closeCardSelection') closeCardSelection: ElementRef


  constructor(
    private aRoute: ActivatedRoute,
    private paymentService: PaymentService,
    private router: Router,
    private userService: UserService,
    private _snackBar: MatSnackBar,
    private getMerFUser: GetMerchantForUserService,
    private translateService: TranslateService,
    private dataEx: DataExchangeService,
    private signalRService: SignalRService,
    private applePayService: ApplePayService
    ) { }

  ngOnInit(): void {
    if(!!localStorage.getItem('token'))
    {
      this.userService.getRole().subscribe(
        res =>
        {
          this.isPayxUser = res['role'] == 2 ? true: false;
        }
      )
    }
    this.showLoader = true;
    this.aRoute.paramMap.pipe(
      switchMap(params => params.getAll('id'))).subscribe(data=>
          {
          const hash = Array.isArray(data) ? data[0] : data;
          this.transferID = hash;
          const merchantUserId =
            this.aRoute.snapshot.queryParamMap.get("merchantUserId") || undefined;
          this.paymentService.getTransaction(hash, merchantUserId).subscribe(
            res =>
            {
              this.transaction = res.body['transaction'] as Transactions;
              if(res.body['merchantUser']['merchantInfo']['companyNameHy'].includes('նոտար'))
              {
                this.notary = true
              }
              this.signalRService.addData(res.body['merchantUser']['merchantUserId'].toString())
              localStorage.setItem('lang', normalizeLanguageCode(this.transaction.language, 'en'))
              if(this.transaction.isBlocked || this.transaction.transactionStatus == 3 || this.transaction.transactionStatus == 4)
              {
                this.router.navigateByUrl(`transaction-not-found/${this.transferID}`)
                return
              }
              this.getNotification = this.dataEx.getNotification()
              .subscribe((res) => {
                console.log('qr res', res)
                  if (res['isPaid'] == 'true') {
                    // this.router.navigateByUrl(`en/px_transfer?transfer_id=${res['transactionId']}`)
                    window.location.href = `en/px_transfer?transfer_id=${res['transactionId']}`
                  }
                },
                err =>{
                  let errmer = err.error.message
                  this._snackBar.open(errmer,'', {
                    duration: 2000
                  });
                });
              this.translateService.use(localStorage.getItem('lang'))
              if(this.transaction.transactionStatus == 2)
              {
                this.router.navigateByUrl(`transfer_success/${this.transferID}`)
                return
              }
                  this.canGenerateQR = res.body['merchantUser']['canGenerateQR']
                  this.isMulti = this.transaction.isMulti;
                  this.newComment = this.transaction.comment;
                  this.linkFromResponse = this.transaction['link']
                  this.amountNgOnInit = this.transaction.amount
                  this.changeComment = this.transaction.canChangeComment
                  this.qrValue = this.transaction['qr']
                  if(this.transaction.amount == 0)
                  {
                    this.changeValue = true;
                  }
                  else{
                    this.changeValue = false
                  }
                  // setTimeout(() => {
                    this.showLoader = false;
                  // }, 1500);
                  // this.showLoader = false;
                // }
              // )
              //
            }
          )
    })
  }

  isAuthenticated()
  {
    return !!sessionStorage.getItem('token')
  }

  getUrlLink(card_id=0)
  {
    if(card_id == -1)
      return;
    if(card_id != 0)
    this.closeCardSelection.nativeElement.click()
    this.showLoader = true;

    if(this.transaction.amount == 0)
    {
      if(this.amount*1 == 0 || this.amount == undefined || Number.isNaN(this.amount) || this.amount == null)
      {
        this.amountError = true
        this.showLoader = false;
        return
      }
      if(this.amount.toString().length > 11)
      {
        this._snackBar.open('Max amount will be less than 100,000,000,000','', {
          duration: 7000
        });
        this.showLoader = false;
        return
      }
      this.submitPay(this.amount * 1);
      return;
    }

    this.submitPay(this.amountNgOnInit * 1);
  }

  private submitPay(amount: number) {
    const payBody = {
      amount,
      transferId: Number(this.transaction.transactionId ?? 0),
      comment: this.newComment != null ? String(this.newComment) : "",
    };
    this.paymentService.pay(payBody).subscribe(
      res =>
      {
        this.showLoader = false;
        const body = res.body as any;
        const apiErr = readPayApiErrorMessage(body);
        if (apiErr) {
          this._snackBar.open(apiErr, '', { duration: 7000 });
          return;
        }
        const formUrl = body && body['formUrl'];
        const redirectUrl = resolvePaymentRedirectUrl(formUrl);
        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        }
        if (res.status === 200 || res.status === 201) {
          this.router.navigateByUrl(`transfer_success/${this.transferID}`)
          return;
        }
      },
      err =>
      {
        this.showLoader = false;
        const apiErr = readPayApiErrorMessage(err?.error);
        if (apiErr) {
          this._snackBar.open(apiErr, '', { duration: 7000 });
          return;
        }
        const errMessage = err?.error?.message || err?.message || '';
        if (errMessage) {
          this._snackBar.open(errMessage, '', { duration: 7000 });
          return;
        }
        this.translateService.get("deals").subscribe(res => {
          this._snackBar.open(res.errorMessage1 || 'Payment failed', '', { duration: 7000 });
        });
      }
    )
  }

  checkAmount()
  {
    if(!(this.amount*1 == 0 || this.amount == undefined ||  Number.isNaN(this.amount) || this.amount == null))
    {
      this.amountError = false;
    }
  }

  downloadQR()
  {
    QRCode.toDataURL(this.qrValue)
    .then((url) =>
    {
      saveAs(url, `QR-ID-${this.transferID}.png`)
    })
  }

  changeCommentFoo()
  {

  }

  getAllUserCards()
  {
    this.userService.getCards().subscribe(
      res=>
      {
        this.cards = res as Card[];
        this.cards.forEach(val=>
          {
            if(val.isDefaultCard)
              this.selectedCardId = val.id
          })
      }
    )
  }



  private async validateMerchant(merchantIdentifier: string): Promise<any> {
    const merchantSessionPromise = new Promise((resolve, reject)=>{
      this.applePayService.validateMerchant(merchantIdentifier)
      .subscribe(
        res =>{
          let merchantSession = res.body
          resolve(merchantSession)
        },
        err =>{
          // this.documentWrite("api/Payment/GetSessionToken error")
          console.log("api/Payment/GetSessionToken error", err)
        }
      )
    })
    return merchantSessionPromise
  }

  // applePayClicked(){
  //   if (!ApplePaySession) {
  //     alert("Apple pay not supported")
  //     return;
  //   }

  //   // Define ApplePayPaymentRequest
  //   const request = {
  //     "countryCode": "AM",
  //     "currencyCode": "AMD",
  //     "merchantCapabilities": [
  //         "supports3DS"
  //     ],
  //     "supportedNetworks": [
  //         "visa",
  //         "masterCard"
  //     ],
  //     "total": {
  //         "label": "Demo (Card is not charged)",
  //         "type": "final",
  //         "amount": "100.00"
  //     }
  //   };
  //   // Create ApplePaySession
  //   const session = new ApplePaySession(3, request);
  //   // this.documentWrite("SESSION CREATED, new ApplePaySession(3, request);")
  //   console.log("SESSION CREATED, new ApplePaySession(3, request);")

  //   session.onvalidatemerchant = async (event: any) => {

  //     // Call your own server to request a new merchant session.
  //     // const merchantSession = await validateMerchant();

  //       // this.documentWrite(`onvalidatemerchant, and event data -> ${event.validationURL}`)
  //       console.log(`onvalidatemerchant, and event data -> ${event.validationURL}`)

  //       this.validateMerchant(this.merchantIdentifier ? this.merchantIdentifier.toString() : "945").then((data) =>{
  //         const merchantSession = data
  //         // this.documentWrite(`FROM BACK END -> ${JSON.stringify(merchantSession)}`)
  //         console.log(`FROM BACK END -> ${JSON.stringify(merchantSession)}`)
  //         session.completeMerchantValidation(merchantSession);
  //       })
  //   };

  //   session.onpaymentmethodselected = event => {
  //     // this.documentWrite(`onpaymentmethodselected, and event data -> ${JSON.stringify(event)}`)
  //     console.log(`onpaymentmethodselected, and event data -> ${JSON.stringify(event)}`)
  //     const update = {
  //         newTotal: {
  //             label: "Demo (Card is not charged)",
  //             amount: "100.00",
  //             type: "final"
  //         }
  //     };
  //     session.completePaymentMethodSelection(update);
  //   };

  //   session.onshippingmethodselected = event => {
  //     // Define ApplePayShippingMethodUpdate based on the selected shipping method.
  //     // No updates or errors are needed, pass an empty object.
  //     console.log(`onshippingmethodselected, event data -> ${JSON.stringify(event)}`)
  //     // this.documentWrite(`onshippingmethodselected, event data -> ${JSON.stringify(event)}`)

  //     const update = {};
  //     session.completeShippingMethodSelection(update);
  //   };

  //   session.onshippingcontactselected = event => {
  //     // Define ApplePayShippingContactUpdate based on the selected shipping contact.
  //     // this.documentWrite(`onshippingcontactselected, event data -> ${JSON.stringify(event)}`)
  //     console.log(`onshippingcontactselected, event data -> ${JSON.stringify(event)}`)
  //     const update = {};
  //     session.completeShippingContactSelection(update);
  //   };

  //   session.onpaymentauthorized = event => {
  //       // Define ApplePayPaymentAuthorizationResult
  //       console.log(`onpaymentauthorized, event data-> ${JSON.stringify((event as any).token)}`)
  //       const result = {
  //           "status": ApplePaySession.STATUS_SUCCESS
  //       };
  //       session.completePayment(result);
  //   };

  //   session.oncancel = (event: any) => {
  //       // Payment cancelled by WebKit
  //       // this.documentWrite(`oncancel`)
  //       console.log(`oncancel`)

  //   };

  //   session.begin();
  // }
}

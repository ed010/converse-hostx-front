import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Transactions } from "src/app/models/transactions.model";
import { PaymentService } from "src/app/services/payment.service";

@Component({
  selector: "app-BadReq",
  templateUrl: "./BadReq.component.html",
  styleUrls: ["./BadReq.component.css"],
})
export class BadReqComponent implements OnInit {
  transactionId: string;
  showLoaderBig: boolean = true;
  transaction: Transactions;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((res) => {
      if (res["transactionId"] != undefined)
        this.transactionId = res["transactionId"];

      this.showLoaderBig = true;
      const merchantUserId = res["merchantUserId"] as string | undefined;
      this.paymentService
        .getTransaction(this.transactionId, merchantUserId)
        .subscribe((res) => {
          this.showLoaderBig = false;

          this.transaction = res.body["transaction"] as Transactions;
        });
    });
  }

  onOkBtnClick() {
    this.router.navigateByUrl(`px_transfer/${this.transactionId}`);
  }

  replaceConverseImgLink(originalUrl: string) {
    let domainPattern = /^(http:\/\/)([^\/]+)(.*)$/;
    let newUrl = originalUrl.replace(domainPattern, "$1pay.conversebank.am$3");
    return newUrl;
  }
}

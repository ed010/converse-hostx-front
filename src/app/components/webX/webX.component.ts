import { Component, OnInit } from "@angular/core";
import { UserService } from "src/app/services/payx/user.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Card } from "src/app/models/payx/card.model";
import { WebXService } from "src/app/services/webX/webX.service";

@Component({
  selector: "app-webX",
  templateUrl: "./webX.component.html",
  styleUrls: ["./webX.component.css"],
})
export class WebXComponent implements OnInit {
  loadingToggle: boolean = true;
  errorToggle: boolean = false;
  pxNumber: string;
  showCards: boolean = false;
  qr: string;
  selectedCard: number = -1;
  payByUserSuccess: boolean = false;

  bind: string;
  client_id: string;

  payed: boolean = false;

  cards: Card[] = [];

  link: string = "";

  constructor(
    private roleCkeck: UserService,
    private router: Router,
    private aRoute: ActivatedRoute,
    private webXService: WebXService
  ) {}

  ngOnInit() {
    if (
      localStorage.getItem("c2f817aaf4604172039825c35853fec90c03d5f3") == "2"
    ) {
      this.showCards = true;
      this.roleCkeck.getCards().subscribe(
        (res) => {
          this.cards = res as Card[];
        },
        (err) => {
          this.showCards = false;
          localStorage.setItem(
            "c2f817aaf4604172039825c35853fec90c03d5f3",
            "-1"
          );
        }
      );
    }
    this.aRoute.queryParams.subscribe((params) => {
      this.pxNumber = params["pxNumber"];
      this.bind = params["IsBind"];
      this.client_id = params["client_id"];
      let isArca = params["isArca"];
      this.webXService.getTransaction(this.pxNumber).subscribe(
        (res) => {
          this.qr = res.body["qr"];
          this.link = `${window.location.origin}/px_transfer/${this.pxNumber}`;
          this.onClickPayByCard();

          if (isArca == "true") {
            this.onClickPayByCard();
          } else {
            this.loadingToggle = false;
          }
        },
        (err) => {
          if (err.status == 302) {
            location.href = err.error["returnUrl"];
          }
          if (err.status == 400) {
            this.loadingToggle = false;
            this.errorToggle = true;
          }
        }
      );
    });
  }

  payByUserBtnClick() {
    if (localStorage.getItem("token")) {
      this.roleCkeck.getRole().subscribe(
        (res) => {
          if (res["role"] == 2) {
            localStorage.setItem(
              "c2f817aaf4604172039825c35853fec90c03d5f3",
              "2"
            );
            this.roleCkeck.getCards().subscribe((res) => {
              this.cards = res as Card[];
              this.showCards = true;
            });
          } else this.router.navigateByUrl(`?pxNumber=${this.pxNumber}`);
        },
        (err) => {
          this.router.navigateByUrl(`?pxNumber=${this.pxNumber}`);
        }
      );
    } else this.router.navigateByUrl(`?pxNumber=${this.pxNumber}`);
  }

  onClickPayByCard() {
    let b;
    try {
      b = this.bind[0] == "T" ? true : false;
    } catch {
      b = false;
    }
    let cId = this.client_id ? this.client_id.toString() : "-1";
    this.webXService.payByCard(this.pxNumber, b, cId).subscribe((res) => {
      location.href = res["formUrl"];
    });
  }

  payByUser() {
    this.webXService
      .payByUser(this.pxNumber, this.selectedCard)
      .subscribe((res) => {
        localStorage.setItem("c2f817aaf4604172039825c35853fec90c03d5f3", "-1");
        this.showCards = false;
        this.payByUserSuccess = true;
        setTimeout(() => {
          location.href = res["returnUrl"];
        }, 1500);
      });
  }

  onCancelBtnClick() {
    this.showCards = false;
    localStorage.setItem("c2f817aaf4604172039825c35853fec90c03d5f3", "-1");
  }

  onClickOkBtn() {
    this.router.navigateByUrl("/");
  }
}

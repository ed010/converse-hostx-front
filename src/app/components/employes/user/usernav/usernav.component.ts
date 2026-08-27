import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { MerchantIdTitle } from "src/app/models/merchantIdTitle";
import { DataExchangeService } from "src/app/services/dataExchange.service";
import { GetMerchantForUserService } from "src/app/services/getMerchantForUser.service";
import { SignalRService } from "src/app/services/signalR.service";

@Component({
  selector: "app-usernav",
  templateUrl: "./usernav.component.html",
  styleUrls: ["./usernav.component.css"],
})
export class UsernavComponent implements OnInit {
  merchants: MerchantIdTitle[];
  checkAM: boolean;
  checkRU: boolean;
  checkEN: boolean;
  selectedMerchant: MerchantIdTitle;
  logo: string = "";
  merchant: any;
  langText = "en";
  constructor(
    private dataEx: DataExchangeService,
    private getMerFUser: GetMerchantForUserService,
    private translate: TranslateService,
    private router: Router,
    private signalRService: SignalRService
  ) {}

  ngOnInit() {
    localStorage.getItem("lang") == "ru"
      ? (this.langText = "ru")
      : localStorage.getItem("lang") == "am"
      ? (this.langText = "am")
      : "en";
    this.signalRService.startConnection(localStorage.getItem("token"));
    setTimeout(() => {
      this.signalRService.listenerWS();
    }, 1000);
    this.checkAM = localStorage.getItem("lang") == "am" ? true : false;
    this.checkRU = localStorage.getItem("lang") == "ru" ? true : false;
    this.checkEN = localStorage.getItem("lang") == "en" ? true : false;
    this.translate.use(localStorage.getItem("lang"));
    const get_id_promise = new Promise((reslove, reject) => {
      let id = localStorage.getItem("id");
      reslove(id);
    });
    get_id_promise.then((data) => {
      this.getMerFUser.getMerchantUser(data).subscribe((res) => {
        this.merchants = res.merchants ?? [];
        this.merchant = res;
        this.logo;
        if (this.merchants?.length) {
          this.selectedMerchant = this.merchants[0];
          this.dataEx.setMerId(this.merchants[0].id);
        }
      });
    });
  }
  change(id: number) {
    this.selectedMerchant = this.merchants.filter((elem) => elem.id == id)[0];
    if (this.merchants.length == 1) this.dataEx.setMerId(this.merchants[0].id);
    else this.dataEx.setMerId(id);

    let merObject = this.merchants.find((e) => e.id == id);
    this.dataEx.updateMerchantTr(merObject);
    this.dataEx.setMerId(id);
  }
  changeLang(lang: string) {
    this.langText = lang;
    this.checkAM = lang == "am" ? true : false;
    this.checkRU = lang == "ru" ? true : false;
    this.checkEN = lang == "en" ? true : false;
    localStorage.setItem("lang", lang);
    this.translate.use(lang);
  }
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenr");
    localStorage.removeItem("id");
    this.router.navigateByUrl("");
  }
  chPass() {
    this.router.navigate(["change-password"]);
  }
  openMenu() {
    document.getElementById("header__burger").classList.toggle("active");
    document.getElementById("menu").classList.toggle("active");
  }

  replaceConverseImgLink(originalUrl: string) {
    let domainPattern = /^(http:\/\/)([^\/]+)(.*)$/;
    let newUrl = originalUrl?.replace(domainPattern, "$1pay.conversebank.am$3");
    return newUrl;
  }
}

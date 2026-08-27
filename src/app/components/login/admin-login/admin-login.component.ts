import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { Login } from "src/app/models/login.model";
import { DataExchangeService } from "src/app/services/dataExchange.service";
import { LoginService } from "src/app/services/login.service";

@Component({
  selector: "app-admin-login",
  templateUrl: "./admin-login.component.html",
  styleUrls: ["./admin-login.component.scss"],
})
export class AdminLoginComponent implements OnInit {
  login: Login = new Login();
  loginIsValid: boolean = true;
  errorMessage: string = "";

  langText = "en";
  checkAM: boolean;
  checkRU: boolean;
  checkEN: boolean;

  date: Date;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private dataEx: DataExchangeService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.date = new Date();
    if (localStorage.getItem("lang")) {
      localStorage.getItem("lang") == "ru"
        ? (this.langText = "ru")
        : localStorage.getItem("lang") == "am"
        ? (this.langText = "am")
        : "en";
      this.checkAM = localStorage.getItem("lang") == "am" ? true : false;
      this.checkRU = localStorage.getItem("lang") == "ru" ? true : false;
      this.checkEN = localStorage.getItem("lang") == "en" ? true : false;
      this.translate.use(localStorage.getItem("lang"));
    } else {
      this.translate.use("en");
    }

    // console.log(this.router.url=="/adminLogin")
    // this.messagingService.requestPermission();
    // this.messagingService.receiveMessage();
  }

  changeLang(lang: string) {
    this.langText = lang;
    this.checkAM = lang == "am" ? true : false;
    this.checkRU = lang == "ru" ? true : false;
    this.checkEN = lang == "en" ? true : false;
    localStorage.setItem("lang", lang);
    this.translate.use(lang);
  }

  onSubBtnClick() {
    if (this.router.url != "/adminLogin") {
      this.loginService.login(this.login).subscribe(
        (res) => {
          if (!this.loginService.isAuthenticated(res)) {
            this.errorMessage = "Incorrect username or password";
            this.loginIsValid = false;
            return;
          }
          this.loginService.saveSession(res);
          this.router.navigateByUrl("user/qr");
        },
        (err) => {
          if (err.status == 401 || err.status == 400) {
            this.errorMessage = err?.error?.message;
            this.loginIsValid = false;
          }
        }
      );
      return;
    }
    this.loginService.Authentify(this.login).subscribe(
      (res) => {
        localStorage.setItem("token", res.token ?? "");
        this.router.navigateByUrl("/admin/transactions?page=1");
      },
      (err) => {
        if (err.status == 401 || err.status == 400) {
          this.errorMessage = err?.error?.message;
          this.loginIsValid = false;
        }
      }
    );
  }
  resetPassword() {
    this.router.navigateByUrl("/forgot-password");
  }
}

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { LoginService } from "src/app/services/login.service";

@Component({
  selector: "app-user-login",
  templateUrl: "./user-login.component.html",
  styleUrls: ["./user-login.component.scss"],
})
export class UserLoginComponent implements OnInit {
  langText = "en";
  checkAM: boolean;
  checkRU: boolean;
  checkEN: boolean;

  registerForm!: FormGroup;
  loginForm!: FormGroup;

  showErrMessage: boolean = false;
  errMessage!: string;
  date: Date;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: LoginService
  ) {}

  ngOnInit(): void {
    this.date = new Date();
    this.buildForms();
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
    if (localStorage.getItem("token")) {
      this.router.navigateByUrl("user/qr");
    }
    // this.registerForm = this.formBuilder.group({
    //   firstName: ["", Validators.required],
    //   lastname: ["", [Validators.required]],
    //   password: ["", [Validators.required, Validators.minLength(8)]],
    //   confirmPassword: ["", [Validators.required, Validators.minLength(8)]],
    //   phoneNumber: ["", [Validators.required, Validators.minLength(8)]],
    // });
  }

  buildForms() {
    this.loginForm = this.formBuilder.group({
      username: ["", Validators.required],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  changeLang(lang: string) {
    this.langText = lang;
    this.checkAM = lang == "am" ? true : false;
    this.checkRU = lang == "ru" ? true : false;
    this.checkEN = lang == "en" ? true : false;
    localStorage.setItem("lang", lang);
    this.translate.use(lang);
  }

  loginUser() {
    if (this.loginForm.invalid) return;
    this.showErrMessage = false;
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        if (!this.authService.isAuthenticated(res)) {
          this.showErrMessage = true;
          this.errMessage = "Incorrect username or password";
          return;
        }
        this.authService.saveSession(res);
        this.router.navigateByUrl("user/qr");
      },
      error: (err) => {
        this.showErrMessage = true;
        this.errMessage = err?.error?.message ?? "Incorrect username or password";
      },
    });
  }
}

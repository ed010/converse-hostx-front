import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from "@angular/common/http";
import { RouterModule, Routes } from "@angular/router";
import { QrCodeModule } from "ng-qrcode";
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { MatButtonModule } from "@angular/material/button";
import { MatTableModule } from "@angular/material/table";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";

import { CodeInputModule } from "angular-code-input";
import { MatExpansionModule } from "@angular/material/expansion";

import { TokenInterceptor } from "./interceptors/token.interceptor";
import { BaseUrlInterceptor } from "./interceptors/base-url.interceptor";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./components/login/login.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ProfileGuard } from "./guards/profile.guard";
import { Login } from "./models/login.model";
import { UserComponent } from "./components/employes/user/user.component";
import { MerchantInfo } from "./models/merchantInfo.model";
import { UsernavComponent } from "./components/employes/user/usernav/usernav.component";
import { QeGeneratorComponent } from "./components/employes/user/qe-generator/qe-generator.component";
import { UserTransactionComponent } from "./components/employes/user/user-transaction/user-transaction.component";
import { LoadingComponent } from "./components/shared/loading/loading.component";
import { DealNavbarComponent } from "./components/deals/deal-navbar/deal-navbar.component";
import { MakePaymentComponent } from "./components/deals/make-payment/make-payment.component";
import { SuccessPaymentComponent } from "./components/deals/success-payment/success-payment.component";
import { NgxBarcodeModule } from "ngx-barcode";
import { UserPasswordSettingsComponent } from "./components/employes/user/user-password-settings/user-password-settings.component";
import { IConfig, NgxMaskModule } from "ngx-mask";
import { environment } from "src/environments/environment.prod";

import { JwtModule } from "@auth0/angular-jwt";
import { JwtHelperService, JWT_OPTIONS } from "@auth0/angular-jwt";
import { SuccessComponent } from "./components/shared/success/success.component";
import { BadReqComponent } from "./components/shared/BadReq/BadReq.component";
import { ErrorComponent } from "./components/shared/error/error.component";
import { WebXComponent } from "./components/webX/webX.component";
import { MainPageComponent } from "./components/employes/admin/main-page/main-page.component";
import { MerchantsComponent } from "./components/employes/admin/main-page/pages/merchants/merchants.component";
import { TransactionsComponent } from "./components/employes/admin/main-page/pages/transactions/transactions.component";
import { UsersComponent } from "./components/employes/admin/main-page/pages/users/users.component";
import { EmployeesComponent } from "./components/employes/admin/main-page/pages/settings/employees/employees.component";
import { SettingsComponent } from "./components/employes/admin/main-page/pages/settings/settings.component";
import { SmsComponent } from "./components/employes/admin/main-page/pages/sms/sms.component";
import { MercahntInfoComponent } from "./components/employes/admin/main-page/pages/merchants/mercahnt-info/mercahnt-info.component";
import { MerchantCrudComponent } from "./components/employes/admin/main-page/pages/merchants/merchant-crud/merchant-crud.component";
import { MerchantCrudUpdateComponent } from "./components/employes/admin/main-page/pages/merchants/merchant-crud-update/merchant-crud-update.component";
import { SettingsNavbarComponent } from "./components/employes/admin/main-page/pages/settings/settings-navbar/settings-navbar.component";
import { BanksComponent } from "./components/employes/admin/main-page/pages/settings/banks/banks.component";
import { DomainsComponent } from "./components/employes/admin/main-page/pages/settings/domains/domains.component";
import { MccComponent } from "./components/employes/admin/main-page/pages/settings/mcc/mcc.component";
import { GroupsComponent } from "./components/employes/admin/main-page/pages/settings/groups/groups.component";
import { AddGroupComponent } from "./components/employes/admin/main-page/pages/settings/groups/add-group/add-group.component";
import { ReportComponent } from "./components/employes/admin/main-page/pages/report/report.component";
import { PartnersComponent } from "./components/employes/admin/main-page/pages/settings/partners/partners.component";
import { AdminChangePasswordComponent } from "./components/employes/admin/main-page/pages/change-password/change-password.component";
import { HostxTransactionsComponent } from "./components/employes/admin/main-page/pages/hostx-transactions/hostx-transactions.component";
import { LogsComponent } from "./components/employes/admin/main-page/pages/logs/logs.component";
import { TransactionNotFoundComponent } from "./components/deals/transaction-not-found/transaction-not-found.component";
import { Err404notFoundComponent } from "./components/deals/err404not-found/err404not-found.component";
import { HelpComponent } from "./components/employes/user/help/help.component";
import { DatePipe } from "@angular/common";
import { ReadonlyGuard } from "./guards/readonly.guard";
import { MatDialogModule } from "@angular/material/dialog";
import { ApTestComponent } from "./components/deals/ap-test/ap-test.component";
import { LastFourDigitsPipe } from "./pipes/card-four-digits.pipe";
import { CurrencySymbolPipe } from "./pipes/currency-symbol.pipe";
import { MainComponent } from "./components/new-deals/main/main.component";
import { HeaderComponent } from "./components/new-deals/header/header.component";
import { PaymentComponent } from "./components/new-deals/childs/payment/payment.component";
import { PaymentReceiptComponent } from "./components/new-deals/childs/payment-receipt/payment-receipt.component";
import { PaymentFailedComponent } from "./components/new-deals/childs/payment-failed/payment-failed.component";
import { UserLoginComponent } from "./components/login/user-login/user-login.component";
import { AdminLoginComponent } from "./components/login/admin-login/admin-login.component";
import { FooterLoginComponent } from "./components/login/footer-login/footer-login.component";
import { ApplePayComponent } from "./components/new-deals/apple-pay/apple-pay.component";

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: BaseUrlInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
];
const appRouts: Routes = [
  { path: "", component: UserLoginComponent },
  // { path: "400", component: BadReqComponent },

  { path: "login", component: UserLoginComponent },
  { path: "adminLogin", component: AdminLoginComponent },
  {
    path: "admin",
    component: MainPageComponent,
    canActivate: [ProfileGuard],
    children: [
      {
        path: "merchants",
        component: MerchantsComponent,
        canActivate: [ReadonlyGuard],
      },
      {
        path: "merchants/merchant-info",
        component: MercahntInfoComponent,
        pathMatch: "full",
        canActivate: [ReadonlyGuard],
      },
      {
        path: "merchants/new-merchant",
        component: MerchantCrudComponent,
        pathMatch: "full",
        canActivate: [ReadonlyGuard],
      },
      {
        path: "merchants/update-merchant",
        component: MerchantCrudUpdateComponent,
        pathMatch: "full",
        canActivate: [ReadonlyGuard],
      },
      {
        path: "hostx-transactions",
        component: HostxTransactionsComponent,
        canActivate: [ReadonlyGuard],
      },
      { path: "transactions", component: TransactionsComponent },
      {
        path: "users",
        component: UsersComponent,
        canActivate: [ReadonlyGuard],
      },
      // {path: 'employees', component:EmployeesComponent},
      {
        path: "report",
        component: ReportComponent,
        canActivate: [ReadonlyGuard],
      },
      { path: "sms", component: SmsComponent, canActivate: [ReadonlyGuard] },
      {
        path: "logs",
        component: LogsComponent,
        canActivate: [ReadonlyGuard],
      },
      { path: "settings", redirectTo: "settings/domains" },
      {
        path: "settings",
        component: SettingsComponent,
        canActivate: [ReadonlyGuard],
        children: [
          { path: "banks", component: BanksComponent },
          { path: "domains", component: DomainsComponent },
          { path: "mcc", component: MccComponent },
          { path: "groups", component: GroupsComponent },
          { path: "parters", component: PartnersComponent },
          // {path: 'report', component: ReportComponent},
          { path: "employees", component: EmployeesComponent },
          { path: "change-password", component: AdminChangePasswordComponent },
          { path: "groups/new-group", component: AddGroupComponent },
        ],
      },
    ],
  },
  { path: "user", redirectTo: "user/qr" },
  {
    path: "user",
    component: UserComponent,
    canActivate: [ProfileGuard],
    children: [
      { path: "transactions", component: UserTransactionComponent },
      { path: "qr", component: QeGeneratorComponent },
      { path: "change-password", component: UserPasswordSettingsComponent },
      { path: "help", component: HelpComponent },
    ],
  },
  { path: "ecommerce_pay/webX", component: WebXComponent },
  {
    path: "ecommerce_pay_applePay/webX",
    component: MainComponent,
    children: [{ path: "", component: PaymentComponent }],
  },
  // { path: "px_transfer/:id", component: MakePaymentComponent },
  {
    path: "px_transfer/:id",
    component: MainComponent,
    children: [{ path: "", component: PaymentComponent }],
  },
  {
    path: "pxtransfer/:id",
    component: MainComponent,
    children: [{ path: "", component: PaymentComponent }],
  },
  {
    path: "transfer_success/:id",
    component: MainComponent,
    children: [{ path: "", component: PaymentReceiptComponent }],
  },
  {
    path: "transfer_failed/:id",
    component: MainComponent,
    children: [{ path: "", component: PaymentFailedComponent }],
  },
  {
    path: "400",
    component: MainComponent,
    children: [{ path: "", component: PaymentFailedComponent }],
  },
  {
    path: "transaction-not-found/:id",
    component: TransactionNotFoundComponent,
  },
  // { path: "transfer_success/:id", component: SuccessPaymentComponent },
  // { path: "ap-test/:id", component: ApTestComponent },
  { path: "404", component: Err404notFoundComponent, pathMatch: "full" },
  { path: "**", redirectTo: "/404" },
];

@NgModule({
  declarations: [
    BadReqComponent,
    AppComponent,
    LoginComponent,
    ErrorComponent,
    UserComponent,
    UsernavComponent,
    QeGeneratorComponent,
    UserTransactionComponent,
    LoadingComponent,
    DealNavbarComponent,
    MakePaymentComponent,
    SuccessPaymentComponent,
    SuccessComponent,
    UserPasswordSettingsComponent,
    WebXComponent,
    MainPageComponent,
    MerchantsComponent,
    TransactionsComponent,
    UsersComponent,
    EmployeesComponent,
    SettingsComponent,
    SmsComponent,
    MercahntInfoComponent,
    MerchantCrudComponent,
    MerchantCrudUpdateComponent,
    SettingsNavbarComponent,
    BanksComponent,
    DomainsComponent,
    MccComponent,
    GroupsComponent,
    AddGroupComponent,
    ReportComponent,
    PartnersComponent,
    AdminChangePasswordComponent,
    HostxTransactionsComponent,
    LogsComponent,
    TransactionNotFoundComponent,
    Err404notFoundComponent,
    HelpComponent,
    ApTestComponent,
    LastFourDigitsPipe,
    CurrencySymbolPipe,
    MainComponent,
    HeaderComponent,
    PaymentComponent,
    PaymentReceiptComponent,
    PaymentFailedComponent,
    UserLoginComponent,
    AdminLoginComponent,
    FooterLoginComponent,
    ApplePayComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: "ng-cli-universal" }),
    CodeInputModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(appRouts),
    BrowserAnimationsModule,
    ReactiveFormsModule,
    QrCodeModule,
    MatPaginatorModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    NgxBarcodeModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    NgxMaskModule.forRoot(),
    JwtModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useClass: BaseUrlInterceptor,
    },
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useClass: TokenInterceptor,
    },
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    JwtHelperService,
    DatePipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(translate: TranslateService) {
    if (localStorage.getItem("lang")) {
      translate.setDefaultLang(localStorage.getItem("lang"));
    } else {
      localStorage.setItem("lang", "am");
      translate.setDefaultLang("am");
    }
  }
}

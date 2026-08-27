import { Component, OnDestroy, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { DataExchangeService } from "src/app/services/dataExchange.service";
import { normalizeLanguageCode } from "src/app/utils/language.util";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit, OnDestroy {
  selectedLang: string = "en";

  langText = "en";
  checkAM: boolean;
  checkRU: boolean;
  checkEN: boolean;

  languageForTransaction$: Subscription;

  constructor(
    private translateService: TranslateService,
    private dataExService: DataExchangeService
  ) {
    let local_lang = normalizeLanguageCode(localStorage.getItem("lang"), "en");
    this.langText = local_lang;
    localStorage.setItem("lang", local_lang);
    this.translateService.use(this.langText);

    this.languageForTransaction$ = this.dataExService
      .getLanguage()
      .subscribe((res) => {
        this.langText = normalizeLanguageCode(res, this.langText);
      });
  }

  ngOnInit(): void {}

  changeLanguage(val: string) {
    const lang = normalizeLanguageCode(val, "en");
    localStorage.setItem("lang", lang);
    this.selectedLang = lang;
    this.translateService.use(lang);
  }

  ngOnDestroy(): void {
    this.languageForTransaction$.unsubscribe();
  }

  changeLang(lang: string) {
    const normalizedLang = normalizeLanguageCode(lang, "en");
    this.langText = normalizedLang;
    this.checkAM = normalizedLang == "am" ? true : false;
    this.checkRU = normalizedLang == "ru" ? true : false;
    this.checkEN = normalizedLang == "en" ? true : false;
    localStorage.setItem("lang", normalizedLang);
    this.translateService.use(normalizedLang);
  }
}

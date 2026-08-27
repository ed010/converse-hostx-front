import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export enum Languages{
  am,
  ru,
  en
}


@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {

  currentLang: Languages;


  constructor(
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.currentLang = this.translateService.currentLang == 'am' ? 0 : this.translateService.currentLang == 'ru' ? 1 : 2

    this.translateService.onLangChange.subscribe(res =>{
      this.currentLang = this.translateService.currentLang == 'am' ? 0 : this.translateService.currentLang == 'ru' ? 1 : 2
    })
  }

}

import { Component, OnInit,  Input} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { TranslateService } from '@ngx-translate/core';

import { UserService } from 'src/app/services/payx/user.service';
import { switchMap } from 'rxjs/operators';
import { SignalRService } from 'src/app/services/signalR.service';

@Component({
  selector: 'app-deal-navbar',
  templateUrl: './deal-navbar.component.html',
  styleUrls: ['./deal-navbar.component.css']
})
export class DealNavbarComponent implements OnInit {

  showLoginRegister: boolean = true;
  isPayxUser: boolean = false;
  checkAM: boolean;
  checkRU: boolean;
  checkEN: boolean;
  @Input() notary: boolean = false

  constructor(private auth: AuthService, private router: Router, private userService: UserService,
    private aRoute: ActivatedRoute, private translate: TranslateService, private signalRService: SignalRService ) { }

  ngOnInit(): void {
    this.signalRService.startConnection(localStorage.getItem('token'))
    setTimeout(() => {
      this.signalRService.listenerWS()
    }, 1000);
    this.checkAM = localStorage.getItem('lang') == 'am' ? true : false;
    this.checkRU = localStorage.getItem('lang') == 'ru' ? true : false;
    this.checkEN = localStorage.getItem('lang') == 'en' ? true : false;
    if(localStorage.getItem('token'))
      this.userService.getRole().subscribe(
        res =>
        {
          this.isPayxUser = res['role'] == 2 ? true: false;
        }
      )
    this.auth.isAuthenticatedPayX().subscribe(
      res =>
      {
        this.showLoginRegister = res
      }
    )
  }

  changeLang(lang: string){
    console.log(lang)
    this.checkAM = lang == 'am' ? true : false;
    this.checkRU = lang == 'ru' ? true : false;
    this.checkEN = lang == 'en' ? true : false;
    localStorage.setItem('lang', lang)
    this.translate.use(lang)
  }

  logOut()
  {
    localStorage.removeItem('token')
    location.reload()
  }
  login()
  {
    this.aRoute.paramMap.pipe(
      switchMap(params => params.getAll('id'))).subscribe(data=>
          {
          var transferID = data
          this.router.navigateByUrl(`physical-user/login?transferId=${transferID}`)
        }
      )

    // if(localStorage.getItem('token'))
    // return

  }
  // 114122
}

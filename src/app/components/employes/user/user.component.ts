import { Component, DoCheck, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MerchantIdTitle } from 'src/app/models/merchantIdTitle';
import { DataExchangeService } from 'src/app/services/dataExchange.service';
import {JwtHelperService} from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {

  // data: Subscription
  merchants: MerchantIdTitle[];
  selectedMer: string


  userActivity;
  userInactive: Subject<any> = new Subject();

  constructor(
    private dataEx: DataExchangeService,
    private jwtHelper: JwtHelperService,
    private router: Router,
    ) {

      this.setTimeout();
      this.userInactive.subscribe(() => this.router.navigateByUrl("").then((data) => {localStorage.removeItem("token"); localStorage.removeItem("tokenr")}));
     }

    setTimeout() {
    this.userActivity = setTimeout(() => this.userInactive.next(undefined), 300 * 1000);
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    localStorage.removeItem('token')
  }

  @HostListener('window:mousemove') refreshUserState1() {
    clearTimeout(this.userActivity);
    this.setTimeout();
  }
  @HostListener('window:touchstart') refreshUserState2() {
    clearTimeout(this.userActivity);
    this.setTimeout();
  }
  @HostListener('window:scroll') refreshUserState3() {
    clearTimeout(this.userActivity);
    this.setTimeout();
  }
  @HostListener('window:click') refreshUserState4() {
    clearTimeout(this.userActivity);
    this.setTimeout();
  }
  @HostListener('window:keydown') refreshUserState5() {
    clearTimeout(this.userActivity);
    this.setTimeout();
  }


}

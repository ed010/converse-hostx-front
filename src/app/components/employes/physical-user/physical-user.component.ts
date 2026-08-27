import { Component, DoCheck, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {JwtHelperService} from '@auth0/angular-jwt';


@Component({
  selector: 'app-physical-user',
  templateUrl: './physical-user.component.html',
  styleUrls: ['./physical-user.component.css']
})
export class PhysicalUserComponent implements OnInit, DoCheck {

  constructor(private jwtHelper: JwtHelperService, private router: Router) { }

  ngOnInit(): void {
  }

  ngDoCheck()
  {
    const user = this.jwtHelper.decodeToken(localStorage.getItem('token'))
    if(user['UserId'] == 2 && this.jwtHelper.isTokenExpired(localStorage.getItem('token')))
    {
      this.router.navigateByUrl('physical-components/login')
    }
  }

}

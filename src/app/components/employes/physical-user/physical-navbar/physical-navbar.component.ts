import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-physical-navbar',
  templateUrl: './physical-navbar.component.html',
  styleUrls: ['./physical-navbar.component.css']
})
export class PhysicalNavbarComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  logout()
  {
    this.router.navigateByUrl('physical-user/login')
    .then(del =>{
      localStorage.removeItem('token')
    })
  }

}

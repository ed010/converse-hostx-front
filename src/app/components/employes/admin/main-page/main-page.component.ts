import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeService } from 'src/app/services/employee.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {
  role: number = 5

  readOnlyUser: boolean = false

  constructor(private router: Router, private employeeService: EmployeeService) {
    this.employeeService.getCurrentAdminInfo().subscribe(
      res =>{
        let result = res.body as any
        this.role = result.role
        this.readOnlyUser = this.role === 5 ? true : false
      }
    )
  }


  ngOnInit(): void {
  }

  logOut()
  {
    this.router.navigateByUrl('adminLogin').then(() =>
    {
      localStorage.removeItem('token')
    })
  }

}

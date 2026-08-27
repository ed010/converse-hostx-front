import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { EmployeeService } from '../services/employee.service';

@Injectable({
  providedIn: 'root'
})
export class ReadonlyGuard implements CanActivate {
  constructor(private router: Router, private employeeService: EmployeeService){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): any {

      return this.employeeService.getCurrentAdminInfo().pipe(
        map((res) =>{
          let result = res.body as any
          let role = result.role
          if(role === 5)
          {
            this.router.navigateByUrl("admin/transactions?page=1")
            return false
          }
          else
          {
            return true;
          }
        })
      )
  }

}

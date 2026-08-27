import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

constructor(private http:HttpClient) { }

  getEmployee(id:number){
    const params=new HttpParams()
    .set("id",id.toString());
    return this.http.get(`/api/Employee/GetEmployee`,{params,observe:"response"})
  }

  getEmployees(){
    return this.http.get(`/api/Employee/GetEmployees`,{observe:"response"})
  }

  addEmployee(employee: Pick<Employee, 'fullname' | 'username' | 'password' | 'role'>) {
    return this.http.post(
      `/api/Employee/AddEmployee`,
      {
        fullname: employee.fullname,
        username: employee.username,
        password: employee.password,
        role: employee.role,
      },
      { observe: 'response' }
    );
  }

  updateEmployee(employee:Employee){
    return  this.http.put(`/api/Employee/UpdateEmployee`,employee,{observe:"response"})
  }

  deleteEmployee(id:number){
    const params=new HttpParams()
    .set("id",id.toString());
    return this.http.delete(`/api/Employee/RemoveEmployee`,{params,observe:"response"})
  }

  getCurrentAdminInfo()
  {
    return this.http.get(`/api/Employee/getCurrentAdminInfo`, {observe: "response"})
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.put(
      `/api/Employee/ChangePassword`,
      { currentPassword, newPassword },
      { observe: 'response' }
    );
  }
}

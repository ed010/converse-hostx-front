import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Login } from 'src/app/models/login.model';
import { User } from 'src/app/models/payx/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthPayxService {

constructor(private http: HttpClient) { }

  login(login:Login){
    return this.http.post(`/api/Login/LoginPayX`,login,{observe:"response"})
  }

  activateUser(phone:string,code:string){
    var b={
      phone:phone,
      code:code
    }
    return this.http.post(`/api/User/Activate`,b,{observe:"response"})
  }

  register(user:User){
    return this.http.post(`/api/User/Register`,user,{observe:"body"})
  }

  sendActivationCode(p:string){
    var b={
      phone:p
    }
    return this.http.post(`/api/User/SendActivationCode`,b,{observe:'response'})
  }

  sendCode(p:string){
    var b={
      phone:p
    }
    return this.http.post(`/api/User/SendActivationCodeForReset`,b,{observe:"body"})
  }

  validateRes(p:string,c:string){
    var b={
      phone:p,
      code:c
    }
    return this.http.post(`/api/User/ValidateReseting`,b,{observe:"body"})
  }

  resetPassword(p:string,pass:string){
    var b={
      username:p,
      password:pass
    }
    return this.http.post(`/api/User/ResetPassword`,b,{observe:"response"})
  }



}

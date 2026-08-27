import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DiscountCard } from 'src/app/models/payx/discountCard.model';
import { Limit } from 'src/app/models/payx/limit.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

constructor(private http:HttpClient) { }

  getCards(){
    return this.http.get(`/api/User/GetCards`,{observe:"body"})
  }

  getCardRegLink(){
    return this.http.get(`/api/User/GenerateArcaCardRegistrationLink`,{observe:"body"})
  }

  changeCardName(name:string,id:number){
    var body={
      cardId: id,
      cardName: name
    }
    return this.http.put(`/api/User/ChangeCardName`,body,{observe:"response"})
  }

  setDefaultCard(id)
  {
    return this.http.put(`/api/User/SetDefaultCard?cardId=${id}`,{observe:"response"})
  }

  deleteCard(id)
  {
    return this.http.delete(`/api/User/RemoveCard?cardId=${id}`, {observe:"body"})
  }

  getHistory(){
    return this.http.get(`/api/User/GetHistory`,{observe:"body"})
  }

  getClubCards(){
    return this.http.get(`/api/DicsountCard/GetDiscountCards`,{observe:"body"})
  }

  addClubCard(dCard:DiscountCard){
    return this.http.post(`/api/DicsountCard/AddDiscountCard`,dCard,{observe:"response"})
  }

  deleteClubCard(id:number){
    return this.http.delete(`/api/DicsountCard/RemoveDiscountCard?cardId=${id}`,{observe:"response"})
  }

  updateClubCard(dCard:DiscountCard){
    return this.http.put(`/api/DicsountCard/UpdateDiscountCard`,dCard,{observe:"response"})
  }

  getUser(){
    return this.http.get(`/api/User/GetUser`,{observe:"body"})
  }

  getLimits(){
    return this.http.get(`/api/User/GetLimits`,{observe:"response"})
  }

  setLimits(body: Limit){
    return this.http.put(`/api/User/UpdateLimit`, body, {observe:"response"})
  }

  updateUser(body){
    return this.http.put(`/api/User/UpdateUser`, body, {observe:"body"})
  }

  updateUserPassword(body)
  {
    return this.http.put(`/api/User/ChangePassword`, body, {observe: 'body'})
  }

  getRole()
  {
    return this.http.get(`/api/Login/GetRole`, {observe: 'body'})
  }
}

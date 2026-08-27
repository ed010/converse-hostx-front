import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr'
import { DataExchangeService } from './dataExchange.service';
import { NotificationService } from './notification.service';


@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  hubConnection!: signalR.HubConnection;

  constructor(
    private http: HttpClient,
    private notifyService: NotificationService,
    private dataEx: DataExchangeService
    ) { }

    public startConnection = (token) => {
      this.hubConnection = new signalR.HubConnectionBuilder()
                              .withUrl('/orderHub', {accessTokenFactory: ()=> token})
                              .withAutomaticReconnect()
                              .build();
      this.hubConnection
        .start()
        .then(() => console.log())
        .catch((err: any) => console.log('Error while starting connection: ' + err))
    }


    addData = (msg:string) => {
      console.log("ADDING DATA", msg)
      this.hubConnection.invoke('join', msg)
      .then(() => console.log("okkk", msg))
      .catch((err:any)=>{'error'})
    }

    listenerWS = () =>{
      console.log("Listening")
      this.hubConnection.on('sendNotification', (data)=>{
      if(data != undefined)
      console.log(data)
      this.dataEx.updateNotification(data)
      this.notifyService.sendNotification(data)
      })
    }

}

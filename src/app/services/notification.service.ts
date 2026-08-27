import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

constructor() { }

  getPermission()
  {
    if(Notification.permission != 'granted')
      Notification.requestPermission()
  }

  sendNotification(data)
  {
    const greeting = new Notification(`Transaction with id ${data['transactionId']} was paid`, {
      body: `Transaction with id ${data['transactionId']} was paid`,
      icon: '../../assets/image/bank/Converse.png',
    });

    greeting.addEventListener('click', ()=>{
        window.open(`https://elitegroup.payx.am/transfer_success/${data['transactionId']}`)
      })
  }
}

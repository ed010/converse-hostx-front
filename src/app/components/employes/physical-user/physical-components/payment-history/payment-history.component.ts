import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/payx/user.service';
import { History } from '../../../../../models/payx/history.model'
@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.css']
})
export class PaymentHistoryComponent implements OnInit {

  history:History[]=[];

  selectedHistory:History=new History();

  constructor(private userService:UserService) { }

  ngOnInit(): void {
    this.userService.getHistory().subscribe(
      res=>{
        this.history=res as History[];
        console.log(this.history)
      }
    )
  }

  selectHistory()
  {
    console.log(this.selectedHistory)
  }

}

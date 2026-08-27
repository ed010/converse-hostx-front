import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Transactions } from 'src/app/models/transactions.model';
import { ShowTransactionsService } from 'src/app/services/showTransactions.service';

@Component({
  selector: 'app-paidpage',
  templateUrl: './paidpage.component.html',
  styleUrls: ['./paidpage.component.css']
})
export class PaidpageComponent implements OnInit {

  transferId: number;
  transaction: Transactions;

  constructor(private activatedRoute: ActivatedRoute, private showTr: ShowTransactionsService) {
    activatedRoute.queryParams.subscribe(
      res =>
      {
        this.transferId = res['transferId']
        console.log(this.transferId)
      }
    )
   }

  ngOnInit(): void {
    this.showTr.getTransaction(this.transferId).subscribe(
      res =>
      {
        this.transaction = res.body as Transactions;
        console.log(this.transaction)
      }
    )
  }

}

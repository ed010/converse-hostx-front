import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Bank } from 'src/app/models/bank.model';
import { BankService } from 'src/app/services/bank.service';
import { ReportService } from 'src/app/services/report.service';

export interface HistoryObject{
  id: number,
  from: Date,
  to: Date
}

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  historyObj: HistoryObject[] = []
  currHistory: HistoryObject;
  banks: Bank[] = []
  showLoaderDownload: boolean = false
  showLoaderDownload2: boolean = false
  showLoader: boolean = true

  constructor(
    private reportService: ReportService,
    private bankService: BankService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.bankService.getBanks().subscribe(res=>{
      this.banks = res;
      this.reportService.getHistory().subscribe(res=>{
        this.historyObj = res.body as HistoryObject[]
        this.currHistory = this.historyObj.shift()
        this.showLoader = false
      })
    },
    err=>{
      this.showLoader = false
        let errmer = err?.error?.message
        this._snackBar.open(errmer,'', {
          duration: 7000
        });
    }
    )
  }

  downloadFile()
  {
    this.showLoaderDownload = true
    let start = this.historyObj[0].to
    var tzoffset = (new Date()).getTimezoneOffset() * 60000;
    var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
    let end = localISOTime
    let body= {
      bankId: this.banks[0].id,
      from: start,
      to: end
    }
    this.reportService.extractFile(body).subscribe(
      res =>{
        let blob = new Blob([res.body], { type: "application/octet-stream" });
        let url = window.URL.createObjectURL(blob);
        let anchor = document.createElement("a");
        anchor.download = res.headers.get('Content-Disposition').split('"')[1];
        anchor.href = url;
        anchor.click();
        this.ngOnInit()
        this.showLoaderDownload = false
      },
      err =>{
        this.showLoaderDownload = false
        this._snackBar.open('Transactions not found','', {
          duration: 7000
        });
      }
    )
  }
  downloadFileSelect(val)
  {
    if(val*1 == -1)
    {
      return
    }
    this.showLoaderDownload2 = true
    let ob = this.historyObj.find(i => i.id == val*1)
    let body = {
      bankId: this.banks[0].id,
      from: ob.from,
      to: ob.to
    }
    this.reportService.extractFile(body).subscribe(
      res =>{
        let blob = new Blob([res.body], { type: "application/octet-stream" });
        let url = window.URL.createObjectURL(blob);
        let anchor = document.createElement("a");
        anchor.download = res.headers.get('Content-Disposition').split('"')[1];
        anchor.href = url;
        anchor.click();
        this.ngOnInit()
        this.showLoaderDownload2 = false
      },
      err =>{
        this.showLoaderDownload2 = false
        this._snackBar.open('Transactions not found','', {
          duration: 7000
        });
      }
    )

  }
}

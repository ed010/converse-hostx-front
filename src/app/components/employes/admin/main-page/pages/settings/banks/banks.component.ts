import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Bank } from 'src/app/models/bank.model';
import { BankService } from 'src/app/services/bank.service';

@Component({
  selector: 'app-banks',
  templateUrl: './banks.component.html',
  styleUrls: ['./banks.component.scss']
})
export class BanksComponent implements OnInit, OnDestroy {

  banks:Bank[] = [];
  bank:Bank = new Bank;
  selectedBank:Bank = new Bank;

  @ViewChild('closeAddModal') closeAddModal: ElementRef
  @ViewChild('closeInfoModal') closeInfoModal: ElementRef
  @ViewChild('closeUpdateModal') closeUpdateModal: ElementRef


  constructor(
    private bankService:BankService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.bankService.getBanks().subscribe(
      res=>{
        this.banks = res;
      },
      err =>{
        let errmer = err?.error?.message
        this._snackBar.open(errmer,'', {
          duration: 7000
        });
      }
    )
  }


  addBank(){
    if(this.bank.title.length<1)
      return;
    this.bank.id=-1;
    this.bankService.addBank(this.bank).subscribe(
      res=>{
        this.ngOnInit();
        document.getElementById('closeAddModal').click();
      },
      err =>{
        let errmer = err?.error?.message
        this._snackBar.open(errmer,'', {
          duration: 7000
        });
      }
    )
  }


  deleteBank(id:number){
    this.bankService.deleteBank(id).subscribe(
      res=>{
        document.getElementById('closeInfoModal').click();
        this.ngOnInit();
        this.selectedBank=new Bank;
      },
      err =>{
        let errmer = err?.error?.message
        this._snackBar.open(errmer,'', {
          duration: 7000
        });
      }
    )
  }


  updateBank(){
    this.bankService.updateBank(this.selectedBank).subscribe(
      res=>{
        this.ngOnInit();
      },
      err =>{
        let errmer = err?.error?.message
        this._snackBar.open(errmer,'', {
          duration: 7000
        });
      }
    )
  }


  ngOnDestroy(): void {
    this.closeAddModal?.nativeElement?.click()
    this.closeInfoModal?.nativeElement?.click()
    this.closeUpdateModal?.nativeElement?.click()
  }

}

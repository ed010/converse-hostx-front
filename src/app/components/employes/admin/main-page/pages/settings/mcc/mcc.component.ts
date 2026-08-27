import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Bank } from 'src/app/models/bank.model';
import { Mcc } from 'src/app/models/mcc.model';
import { MccBankTariffs } from 'src/app/models/mccBankTariffs.model';
import { BankService } from 'src/app/services/bank.service';
import { DomainService } from 'src/app/services/domain.service';
import { MccService } from 'src/app/services/mcc.service';

@Component({
  selector: 'app-mcc',
  templateUrl: './mcc.component.html',
  styleUrls: ['./mcc.component.scss']
})
export class MccComponent implements OnInit, OnDestroy {

  banks:Bank[] = [];
  mccs: Mcc[] = []
  stelectedMcc: Mcc;
  showLoader: boolean = false


  bankFormMcc: FormGroup
  newMcc: FormGroup


  @ViewChild('closeAddModal') closeAddModal: ElementRef
  @ViewChild('closeUpdateModal') closeUpdateModal: ElementRef



  constructor(
    private mccService: MccService,
    private domainService: DomainService,
    private bankService: BankService,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getBanks()
    this.getMCC()
    this.buildForms()

  }



  buildForms(){
    this.bankFormMcc = this.formBuilder.group({
      mccCode: [],
      activityType: [],
      banksForm: this.formBuilder.array([])
    })

    this.newMcc = this.formBuilder.group({
      mccCode: [],
      activityType: [],
      banksFormNewMcc: this.formBuilder.array([])
    })

  }

  get banksForm() {
    return this.bankFormMcc.controls['banksForm'] as FormArray
  }

  get getBanksFormForNewMcc()
  {
    return this.newMcc.controls['banksFormNewMcc'] as FormArray
  }

  setBankFormArrayForNewMcc()
  {
    this.getBanksFormForNewMcc.clear()
    this.banks.forEach(val =>
      {
        const bForm = this.formBuilder.group({
          percent: [''],
          bank: this.formBuilder.group({
            id: [],
            title: []
          })
        })
        bForm.get('bank').get('id').setValue(val.id)
        bForm.get('bank').get('title').setValue(val.title)
        this.getBanksFormForNewMcc.push(bForm)
      })
  }

  setBankFormArray(mcc: Mcc)
  {
    this.banksForm.clear()
    this.bankFormMcc.reset()
    this.bankFormMcc.get('mccCode').setValue(mcc.mccCode)
    this.bankFormMcc.get('activityType').setValue(mcc.activityType)

    mcc.mccBankTarifs.forEach(val=>{
      const bForm = this.formBuilder.group({

        percent: [''],
        bank: this.formBuilder.group({
          id: [],
          title: []
        })
      })
      bForm.get('percent').setValue(val.percent)
      bForm.get('bank').get('id').setValue(val.bank.id)
      bForm.get('bank').get('title').setValue(val.bank.title)
      this.banksForm.push(bForm)
    })

    // console.log(mcc.mccBankTarifs)
    console.log(this.banksForm.value)
  }


  getBanks()
  {
    // this.showLoader = true
    this.bankService.getBanks().subscribe(
      res=>{
        this.banks = res;
        // this.showLoader = false
      },
      err=>{
        // this.showLoader = false
        let errmer = err?.error?.message
        this._snackBar.open(errmer,'', {
          duration: 7000
        });

      }
    )
  }

  getMCC()
  {
    // this.showLoader = true
    this.mccService.getMccs().subscribe(
      res=>{
        this.mccs=res.body as Mcc[];
        this.showLoader = false
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

  getPercentBank(id:number,mccBankTariffs:MccBankTariffs[]){
    for(let o of mccBankTariffs){
      if(id==o.bank.id){
        if(!isNaN(o.percent))
        {
          return `${o.percent} %`
        }
        else{
          return `Not set`
        }

      }
    }
  }


  deleteMcc(){
    this.mccService.deleteMcc(this.stelectedMcc.id).subscribe(
      res=>{
        this.ngOnInit();
        this.stelectedMcc=new Mcc;
      },
      err =>{
        let errmer = err?.error?.message
        this._snackBar.open(errmer,'', {
          duration: 7000
        });
      }
    )
  }

  updateMcc()
  {
    // console.log(this.bankFormMcc.value)
    let new_mcc = {
      id: this.stelectedMcc.id,
      domain: this.stelectedMcc.domain,
      activityType: this.bankFormMcc.get('activityType').value,
      mccCode: this.bankFormMcc.get('mccCode').value,
      mccBankTarifs: this.bankFormMcc.get('banksForm').value,
    }

    this.mccService.updateMcc(new_mcc as Mcc).subscribe(
      res => {
        this.ngOnInit()
      },
      err =>{
        let errmer = err?.error?.message
        this._snackBar.open(errmer,'', {
          duration: 7000
        });
      }
    )
  }

  addMcc()
  {
    let new_mcc = {
      domain: this.mccs[0].domain,
      activityType: this.newMcc.get('activityType').value,
      mccCode: this.newMcc.get('mccCode').value,
      mccBankTarifs: this.newMcc.get('banksFormNewMcc').value,
    }
    this.mccService.addMcc(new_mcc as Mcc).subscribe(
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
    this.closeUpdateModal?.nativeElement?.click()

  }

}

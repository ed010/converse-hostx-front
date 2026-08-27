import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Bank } from 'src/app/models/bank.model';
import { MerchantGroup } from 'src/app/models/merchantGroup.model';
import { BankService } from 'src/app/services/bank.service';
import { MerchantGroupService } from 'src/app/services/merchantGroup.service';

@Component({
  selector: 'app-add-group',
  templateUrl: './add-group.component.html',
  styleUrls: ['./add-group.component.scss']
})
export class AddGroupComponent implements OnInit {

  showBank: boolean = true
  banks: Bank[] = [];
  showLoader: boolean = false
  groupForm: FormGroup


  constructor(
    private bankService: BankService,
    private formBuilder: FormBuilder,
    private merchantGroupService: MerchantGroupService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getBanks();
  }


  getBanks()
  {
    this.buildForm()
    this.showLoader = true
    this.bankService.getBanks().subscribe(
      res =>
      {
        this.banks = res;
        this.showLoader = false
      },
      err =>{
        this.showLoader = false
        let errmer = err?.error?.message
        this._snackBar.open(errmer,'', {
          duration: 7000
        });
      }
    )
  }

  setBank(id: number)
  {
    this.showBank = false
    let bank = this.banks.find((b)=>b.id == id*1)
    this.groupForm.get('bank').setValue(bank)
  }

  buildForm()
  {
    this.groupForm = this.formBuilder.group({
      merchantGroupName: ['', [Validators.required]],
      merchantArcaDetails: this.formBuilder.group({
        tidBinding: ['', [Validators.required]],
        bpcTidBindingPassword: ['', [Validators.required]],
        tidApi: ['', [Validators.required]],
        bpcTidApiPassword: ['', [Validators.required]],
      }),
      // bank: this.formBuilder.group({
      //   id: ['', [Validators.required]],
      //   title: ['', [Validators.required]]
      // }),
      mcc: ['', [Validators.required]],
    })
  }



  addGroup()
  {
    this.showLoader = true
    let new_group: MerchantGroup = {
      merchantGroupName: this.groupForm.get('merchantGroupName').value,
      mcc: this.groupForm.get('mcc').value,
      merchantArcaDetails: this.groupForm.get('merchantArcaDetails').value,
      bank: this.banks[0],
      bankPercent: 0,
      id: -1
    }
    this.merchantGroupService.addGroup(new_group as MerchantGroup).subscribe(
      res=>{
        this.showLoader = false
        this.router.navigateByUrl('admin/settings/groups')
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
}

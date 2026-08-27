import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Bank } from 'src/app/models/bank.model';
import { MerchantArcaDetail } from 'src/app/models/merchantArcaDetail.model';
import { MerchantGroup } from 'src/app/models/merchantGroup.model';
import { BankService } from 'src/app/services/bank.service';
import { MerchantGroupService } from 'src/app/services/merchantGroup.service';


@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit, OnDestroy {


  banks: Bank[] = []
  allMerchantGroups: MerchantGroup[] = []
  merchantGroupsByBank: MerchantGroup[] = []
  groupForm: FormGroup
  selectedGroup: MerchantGroup = new MerchantGroup
  showLoader: boolean = false
  showBank: boolean = true
  dateFromTo: FormGroup
  blobLoading: boolean = false

  @ViewChild('closeModalUpdate') closeModalUpdate: ElementRef

  constructor(
    private merchantGroupService: MerchantGroupService,
    private bankService: BankService,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.selectedGroup.merchantArcaDetails = new MerchantArcaDetail
    this.getBanks()
    this.builFormForDate()
    this.getGroups()
  }

  getGroups()
  {
    this.merchantGroupService.getGroups().subscribe(
      res => {
        this.allMerchantGroups = res.body as MerchantGroup[]
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

  builFormForDate() {
    this.dateFromTo = this.formBuilder.group({
      dateRange: new FormGroup({
        start: new FormControl(),
        end: new FormControl(),
      }),
    });

  }


  showDataButton() {
    this.blobLoading = true
    let start = new Date(this.dateFromTo.get("dateRange").get("start").value);
    let end = new Date(this.dateFromTo.get("dateRange").get("end").value);
    if(start.getFullYear() == 1970 && end.getFullYear() == 1970)
    {
      start = new Date('2022-01-01')
      end = new Date('2022-12-31')
      // start.getDate() - 1
      // end.getDate() + 1
    }
    else if(start.getFullYear() != 1970 && end.getFullYear() == 1970)
    {
      end = new Date('2022-12-31')
    }

    let body = {
      groupId: this.selectedGroup.id,
      from: start.toISOString(),
      to: end.toISOString()
    }
    this.merchantGroupService.extractFile(body).subscribe(
      res =>{
        let currentDate = new Date();
      let dformat =
        [
          currentDate.getMonth() + 1,
          currentDate.getDate(),
          currentDate.getFullYear(),
        ].join("/") +
        " " +
        [
          currentDate.getHours(),
          currentDate.getMinutes(),
          currentDate.getSeconds(),
        ].join(":");
      // saveAs(res)
      let blob = new Blob([res.body], { type: "application/octet-stream" });
      let url = window.URL.createObjectURL(blob);
      let anchor = document.createElement("a");
      anchor.download = res.headers.get('Content-Disposition').split('"')[1];
      anchor.href = url;
      anchor.click();
      this.blobLoading = false
      },
      err=>{
        this.blobLoading = true
        let errmer = err?.error?.message
        this._snackBar.open(errmer,'', {
          duration: 7000
        });
      }
    )
  }

  getBanks()
  {
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

  getGroupsByBank(id: number)
  {
    this.showLoader = true
    this.merchantGroupsByBank = []
    this.merchantGroupService.getMerchantGroupsByBank(id).subscribe(
      res=>{
        this.merchantGroupsByBank = res.body as MerchantGroup[]
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

  buildForm(m: MerchantGroup)
  {
    this.selectedGroup = m
    this.groupForm = this.formBuilder.group({
      merchantGroupName: ['', [Validators.required]],
      merchantArcaDetails: this.formBuilder.group({
        tidBinding: ['', [Validators.required]],
        bpcTidBindingPassword: ['', [Validators.required]],
        tidApi: ['', [Validators.required]],
        bpcTidApiPassword: ['', [Validators.required]],
      }),
      // bank: ['', [Validators.required]],
      bank: this.formBuilder.group({
        id: ['', [Validators.required]],
        title: ['', [Validators.required]]
      }),
      mcc: ['', [Validators.required]],
    })
    this.groupForm.get('merchantGroupName').setValue(m?.merchantGroupName)
    this.groupForm.get('merchantArcaDetails').get('tidBinding').setValue(m?.merchantArcaDetails?.tidBinding)
    this.groupForm.get('merchantArcaDetails').get('bpcTidBindingPassword').setValue(m?.merchantArcaDetails?.bpcTidBindingPassword)
    this.groupForm.get('merchantArcaDetails').get('tidApi').setValue(m?.merchantArcaDetails?.tidApi)
    this.groupForm.get('merchantArcaDetails').get('bpcTidApiPassword').setValue(m?.merchantArcaDetails?.bpcTidApiPassword)
    this.groupForm.get('bank').setValue(m?.bank)
    this.groupForm.get('mcc').setValue(m?.mcc)

  }

  setBank(id: number)
  {
    this.showBank = false
    let bank = this.banks.find((b)=>b.id == id*1)
    this.groupForm.get('bank').setValue(bank)
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
      id: this.selectedGroup.id
    }
    this.merchantGroupService.updateGroup(new_group as MerchantGroup).subscribe(
      res=>{
        // this.showLoader = false
        this.closeModalUpdate.nativeElement.click()
        this.ngOnInit()
      },
      err=>{
        // this.showLoader = false
        this.closeModalUpdate.nativeElement.click()
        let errmer = err?.error?.message
        this._snackBar.open(errmer,'', {
          duration: 7000
        });
      }
    )
  }

  ngOnDestroy(): void {
    this.closeModalUpdate?.nativeElement?.click()
  }
}

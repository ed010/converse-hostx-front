import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Partner } from 'src/app/models/partner';
import { PartnersService } from 'src/app/services/partners.service';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.scss']
})
export class PartnersComponent implements OnInit {

  partners: Partner[] = []
  newPartner: FormGroup

  @ViewChild('closeAddModal') closeAddModal: ElementRef
  @ViewChild('closeUpdateModal') closeUpdateModal: ElementRef

  constructor(
    private partnerService:PartnersService,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
    ) { }

  ngOnInit(): void {
    this.partnerService.getPartners().subscribe(
      res =>{
        this.partners = res.body as Partner[]
      }
    )
  }

  useData(partner: Partner)
  {
    this.buildForm()
    this.newPartner.get('qrType').setValue(partner?.qrType)
    this.newPartner.get('systemName').setValue(partner?.systemName)
    this.newPartner.get('baseUrl').setValue(partner?.baseUrl)
    this.newPartner.get('merchantId').setValue(partner?.merchantId)
    this.newPartner.get('token').setValue(partner?.token)
  }

  buildForm(){
    this.newPartner = this.formBuilder.group({
      qrType: ['', Validators.required],
      systemName: ['', Validators.required],
      baseUrl: ['', Validators.required],
      merchantId: ['', Validators.required],
      token: ['', Validators.required]
    })
  }

  addNewPartner()
  {
    let newPartnerObj: Partner = {
      baseUrl: this.newPartner.get('baseUrl').value,
      merchantId: this.newPartner.get('merchantId').value *1,
      qrType: this.newPartner.get('qrType').value,
      systemName: this.newPartner.get('systemName').value,
      token: this.newPartner.get('token').value
    }

    this.partnerService.newPartner(newPartnerObj).subscribe(
      res=>{
        this.ngOnInit();
        this.closeAddModal.nativeElement.click()
      },
      err=>{
        let errmer = err?.error?.Message
          this._snackBar.open(errmer,'', {
            duration: 7000
          });
      }
    )
  }


  updatePartner()
  {
    let newPartnerObj: Partner = {
      baseUrl: this.newPartner.get('baseUrl').value,
      merchantId: this.newPartner.get('merchantId').value *1,
      qrType: this.newPartner.get('qrType').value,
      systemName: this.newPartner.get('systemName').value,
      token: this.newPartner.get('token').value
    }

    this.partnerService.updatePartner(newPartnerObj).subscribe(
      res=>{
        this.ngOnInit();
        this.closeUpdateModal.nativeElement.click()
      },
      err=>{
        let errmer = err?.error?.Message
          this._snackBar.open(errmer,'', {
            duration: 7000
          });
      }
    )
  }

  deletePartner()
  {
    this.partnerService.deletePartner(this.newPartner.get('qrType').value).subscribe(
      res=>{
        this.ngOnInit();
        this.closeUpdateModal.nativeElement.click()

      },
      err=>{
        let errmer = err?.error?.message
          this._snackBar.open(errmer,'', {
            duration: 7000
          });
      }
    )
  }

}

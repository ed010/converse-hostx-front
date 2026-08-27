import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Domain } from 'src/app/models/domain.model';
import { DomainService } from 'src/app/services/domain.service';

@Component({
  selector: 'app-domains',
  templateUrl: './domains.component.html',
  styleUrls: ['./domains.component.scss']
})
export class DomainsComponent implements OnInit, OnDestroy {
  domains:Domain[]=[];

  domain:Domain=new Domain;

  selectedDomain:Domain=new Domain;
  @ViewChild('closeAddModal') closeAddModal: ElementRef
  @ViewChild('closeInfoModal') closeInfoModal: ElementRef
  @ViewChild('closeUpdateModal') closeUpdateModal: ElementRef


  constructor(private domainService:DomainService, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.domainService.getDomains().subscribe(
      res=>{
        this.domains = res.items ?? [];
      },
      err =>{
        let errmer = err?.error?.message
        this._snackBar.open(errmer,'', {
          duration: 7000
        });
      }
    )
  }

  deleteDomain(id:number){
    if(id<1)
      return
    this.domainService.deleteDomain(id).subscribe(
      res=>{
        document.getElementById('closeInfoModal').click();
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

  addDomain(){
    if(this.domain.title.length<1)
      return
    this.domain.id=-1;
    this.domainService.addDomain(this.domain).subscribe(
      res=>{
        document.getElementById('closeAddModal').click();
        this.domain.title = ''
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

  selectDomainForUpdate(domain: Domain) {
    this.selectedDomain = { id: domain.id, title: domain.title };
  }

  updateDomain() {
    if (!this.selectedDomain.title?.trim()) {
      return;
    }

    this.domainService.updateDomain({
      id: this.selectedDomain.id,
      title: this.selectedDomain.title.trim(),
    }).subscribe(
      () => {
        this.closeUpdateModal.nativeElement.click();
        this.ngOnInit();
      },
      err => {
        let errmer = err?.error?.message;
        this._snackBar.open(errmer, '', {
          duration: 7000
        });
      }
    );
  }

  ngOnDestroy(): void {
    this.closeAddModal?.nativeElement?.click()
    this.closeInfoModal?.nativeElement?.click()
    this.closeUpdateModal?.nativeElement?.click()
  }

}

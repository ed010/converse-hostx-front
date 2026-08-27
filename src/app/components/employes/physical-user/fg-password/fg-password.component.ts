import { Component, OnInit } from '@angular/core';
import { AuthPayxService } from 'src/app/services/payx/authPayx.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fg-password',
  templateUrl: './fg-password.component.html',
  styleUrls: ['./fg-password.component.scss']
})
export class FgPasswordComponent implements OnInit {

  toggle:boolean=false;
  codeToggle:boolean=false;
  loading:boolean=false;
  phone:string='';
  code:string='';
  successToggle:boolean=false;
  message:string="You password is changeing successfully"
  constructor(private resetService:AuthPayxService, private router:Router) { }

  ngOnInit() {
    this.click();
  }

  private click(){
    this.toggle=!this.toggle;
    let f=document.getElementsByClassName('front')[0] as HTMLElement;
    let b=document.getElementsByClassName('back')[0] as HTMLElement;
    f.classList.toggle('front-transform')
    b.classList.toggle('back-transform')
  }

  snedResetCode(){
    if(this.codeToggle){
      this.onCodeCompleted(this.code);
      return
    }
    this.loading=true;
    this.resetService.sendCode(this.phone).subscribe(
      res=>{
        this.codeToggle=true;
        this.loading=false;
      },
      err=>{
        this.loading=false;
      }

    )
  }


  onCodeCompleted(event){
    this.loading=true;
    this.resetService.validateRes(this.phone,event).subscribe(
      res=>{
        this.click();
      }
    )
  }
  onCodeChanged(event){
    this.code=event;
  }

  changePassword(p:string,cp:string){
    if(p!=cp)
      return;
    this.resetService.resetPassword(this.phone,p).subscribe(
      res=>{
        this.successToggle=true;
      }
    )

  }

  okClick(){
    this.router.navigateByUrl('');
  }

}

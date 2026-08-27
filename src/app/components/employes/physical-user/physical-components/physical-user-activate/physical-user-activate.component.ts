import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthPayxService } from 'src/app/services/payx/authPayx.service';

@Component({
  selector: 'app-physical-user-activate',
  templateUrl: './physical-user-activate.component.html',
  styleUrls: ['./physical-user-activate.component.css']
})
export class PhysicalUserActivateComponent implements OnInit {

  loading:boolean=false;

  constructor(private activatedRoute:ActivatedRoute, private auth:AuthPayxService, private router:Router) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(
      res=>{
        if(res['phone']==undefined)
          console.log("sda")
      }
    )
  }
  onCodeChanged(event){
    // console.log(event)
  }
  onCodeCompleted(event){
    this.loading=true;
    this.activatedRoute.queryParams.subscribe(
      res=>{
        this.auth.activateUser(res["phone"],event).subscribe(
          res=>{
            this.router.navigateByUrl('physical-user/login')
          }
        )
      },
      err=>{
        this.loading=false;
      }
    )
  }

}

import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/payx/user.service';
import { Limit } from 'src/app/models/payx/limit.model';
import { LimitType } from 'src/app/enums/limitType.enum';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-limits',
  templateUrl: './limits.component.html',
  styleUrls: ['./limits.component.css']
})
export class LimitsComponent implements OnInit {

  limit:Limit=new Limit();
  setLimit: boolean = false;
  limitTtpes: LimitType;
  limitForm: FormGroup

  constructor(private userService:UserService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    console.log(LimitType)
    this.userService.getLimits().subscribe(
      res=>{
        if(res.status == 204)
        {
          this.setLimit = true
          this.limit.count = 0
          this.limit.limitType = 0
          this.limit.maximumAmount = 0
          this.limit.maximumTotalAmount = 0
        }
        else{
          this.limit=res.body as Limit;
          if(!this.limit)
            this.limit=new Limit()
        }
        // {
        //   this.limit.count = 0
        //   this.limit.limitType = 0
        //   this.limit.maximumAmount = 0
        //   this.limit.maximumTotalAmount = 0
        // }
      }
    )
  }

  getType(id:number){
    return LimitType[id];
  }

  buildForm()
  {
    // this.limitForm = this.formBuilder.group({
    //   limit
    // })
  }

  changeLimits()
  {
    if ((this.limit.count == 0 || this.limit.count == undefined) ||
        (this.limit.maximumAmount == 0 || this.limit.maximumAmount == undefined) ||
        (this.limit.maximumTotalAmount == 0 || this.limit.maximumTotalAmount == undefined))
        return
    this.userService.setLimits(this.limit).subscribe(
      res =>
      {
        console.log(res)
      }
    )
  }

}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/payx/user.model';
import { UserService } from 'src/app/services/payx/user.service';


@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.css']
})
export class PersonalInformationComponent implements OnInit {

  user={
    firstName:"",
    lastName:"",
    phone:""
  }
  userClone={
    firstName:"",
    lastName:"",
    phone:""
  }
  loading: boolean = false;
  onSubmitButton: boolean = false;

  passwordForm: FormGroup

  constructor(private userServie:UserService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.buildForm()
    this.userServie.getUser().subscribe(
      res=>{
        this.user.firstName=res['firstname'] as string;
        this.user.lastName=res['lastname'] as string;
        this.user.phone=res['phone'] as string
        this.userClone.firstName=this.user.firstName;
        this.userClone.lastName=this.user.lastName;
      }
    )
  }

  updateInfo()
  {
    this.loading = true;

    const body = {
      firstname: this.user.firstName,
      lastname: this.user.lastName
    }
    this.userServie.updateUser(body).subscribe(
      res =>
      {
        console.log(res)
        this.loading = false;
      }
    )
  }

  validateForm(){
    if(this.userClone.firstName==this.user.firstName && this.userClone.lastName==this.user.lastName)
      return true
    else
      return false
  }

  buildForm()
  {
    this.passwordForm = this.formBuilder.group({
      oldPass: ['', Validators.required],
      newPass: ['', Validators.required],
      confirmPass: ['', Validators.required],
    })
  }


  changePassword()
  {
    const body = {
      password: this.passwordForm.get('oldPass').value,
      newPassword: this.passwordForm.get('newPass').value
    }
    this.userServie.updateUserPassword(body).subscribe(
      res =>
      {
        console.log(res)
      }
    )
  }

}

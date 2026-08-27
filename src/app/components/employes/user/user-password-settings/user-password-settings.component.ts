import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { CustomValidators } from "src/app/classes/validator";
import { MerchantUserService } from "src/app/services/merchantUser.service";

@Component({
  selector: "app-user-password-settings",
  templateUrl: "./user-password-settings.component.html",
  styleUrls: ["./user-password-settings.component.css"],
})
export class UserPasswordSettingsComponent implements OnInit {
  passwordForm: FormGroup;
  oldPassword: string = ''

  constructor(
    private merchantUser: MerchantUserService,
    private formBuilder: FormBuilder,
    private router: Router,
    private _snackBar: MatSnackBar

  ) {}

  ngOnInit(): void {
    this.passwordForm = this.formBuilder.group(
      {
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
      },
      { validators: CustomValidators.confirmValidator }
    );
  }

  changePassword() {
    if (this.oldPassword == '')
    {
      this._snackBar.open('Enter old password','', {
        duration: 2000
      });
      return
    }
    this.merchantUser
      .changePassword(
        this.oldPassword,
        this.passwordForm.get("password").value.toString()
      )
      .subscribe((res) => {
        this.router.navigateByUrl("user/qr");
      },
      err =>
      {
        console.log(err.error.message)
        if(err.error.message == 'Old password is not correct')
        {
          this._snackBar.open('Old password is not correct','', {
            duration: 2000
          });
        }
        else{
          let errmer = err?.error?.errorMessage || err.error.message
            this._snackBar.open(errmer,'', {
              duration: 2000
            });
        }

      });
  }

  // onFile(file) {
  //   let files = file.target.files[0];

  //   console.log(files);
  //   console.log(JSON.parse(JSON.stringify(files)));
  // }
}

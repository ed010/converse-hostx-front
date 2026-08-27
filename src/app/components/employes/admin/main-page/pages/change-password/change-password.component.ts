import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomValidators } from 'src/app/classes/validator';
import { EmployeeService } from 'src/app/services/employee.service';

@Component({
  selector: 'app-admin-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class AdminChangePasswordComponent implements OnInit {
  passwordForm: FormGroup;
  currentPassword = '';
  loading = false;

  constructor(
    private employeeService: EmployeeService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.passwordForm = this.formBuilder.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: CustomValidators.confirmValidator }
    );
  }

  changePassword(): void {
    if (!this.currentPassword) {
      this.snackBar.open('Enter current password', '', { duration: 2000 });
      return;
    }

    const newPassword = this.passwordForm.get('password')?.value?.toString();
    if (newPassword === this.currentPassword) {
      this.snackBar.open('New password must differ from the current password.', '', {
        duration: 7000,
      });
      return;
    }

    this.loading = true;
    this.employeeService.changePassword(this.currentPassword, newPassword).subscribe(
      (res) => {
        this.loading = false;
        const body = res.body as { success?: boolean; errorMessage?: string };
        if (body?.success === false) {
          this.snackBar.open(body.errorMessage || 'Change password failed', '', {
            duration: 7000,
          });
          return;
        }
        this.snackBar.open('Password changed successfully', '', { duration: 3000 });
        this.currentPassword = '';
        this.passwordForm.reset();
      },
      (err) => {
        this.loading = false;
        const message =
          err?.error?.errorMessage ||
          err?.error?.message ||
          'Change password failed';
        this.snackBar.open(message, '', { duration: 7000 });
      }
    );
  }
}

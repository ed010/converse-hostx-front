import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Employee } from 'src/app/models/employee.model';
import { EmployeeService } from 'src/app/services/employee.service';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit, OnDestroy {

  employees: Employee[] = []
  newEmployee: FormGroup
  roles = [{ value: 0, label: 'Admin' }]
  @ViewChild('closeUpdateModal') closeUpdateModal: ElementRef
  @ViewChild('closeAddModal') closeAddModal: ElementRef

  constructor(
    private employeeService:EmployeeService,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getUsers()
  }

  getUsers(){
    this.employeeService.getEmployees().subscribe(
      res=>{
        this.employees=res.body as Employee[];
      },
      err=>{
        let errmer = err?.error?.message
          this._snackBar.open(errmer,'', {
            duration: 7000
          });
      }
    )
  }

  buildForm(){
    this.newEmployee = this.formBuilder.group({
      id: [],
      fullname: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: [0, Validators.required],
    })
  }

  useData(employee: Employee)
  {
    this.buildForm()
    this.newEmployee.get('id').setValue(employee.id)
    this.newEmployee.get('fullname').setValue(employee.fullname)
    this.newEmployee.get('username').setValue(employee.username)
  }

  updateEmployee(){
    let newEmp = {
      id: this.newEmployee.get('id').value,
      fullname: this.newEmployee.get('fullname').value,
      username: this.newEmployee.get('username').value,
      password: '',
      role: 1
    }
    this.employeeService.updateEmployee(newEmp).subscribe(
      res =>
      {
        this.ngOnInit()
        this.closeUpdateModal.nativeElement.click()
      }

    )
  }

  deleteEmployee()
  {
    this.employeeService.deleteEmployee(this.newEmployee.get('id').value*1).subscribe(
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

  addNewEmployee()
  {
    if (this.newEmployee.invalid) {
      return;
    }

    const body = {
      fullname: this.newEmployee.get('fullname').value.trim(),
      username: this.newEmployee.get('username').value.trim(),
      password: this.newEmployee.get('password').value,
      role: this.newEmployee.get('role').value * 1,
    };

    this.employeeService.addEmployee(body).subscribe(
      () => {
        this.getUsers();
        this.closeAddModal.nativeElement.click();
      },
      err => {
        let errmer = err?.error?.message || err?.error?.errorMessage
          this._snackBar.open(errmer,'', {
            duration: 7000
          });
      }
    )
  }


  ngOnDestroy(): void {
    this.closeUpdateModal.nativeElement?.click()
    this.closeAddModal.nativeElement?.click()
  }


}

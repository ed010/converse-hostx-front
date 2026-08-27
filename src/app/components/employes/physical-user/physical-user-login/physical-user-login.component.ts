import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Login } from 'src/app/models/login.model';
import { AuthPayxService } from 'src/app/services/payx/authPayx.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { User } from 'src/app/models/payx/user.model';
import { switchMap } from 'rxjs/operators';
import { LoginService } from 'src/app/services/login.service';
import { TranslateService } from '@ngx-translate/core';
// import { MessagingService } from 'src/app/services/messaging.service';

@Component({
  selector: 'app-physical-user-login',
  templateUrl: './physical-user-login.component.html',
  styleUrls: ['./physical-user-login.component.css']
})
export class PhysicalUserLoginComponent implements OnInit {
  login: Login = new Login();
  loginIsValid: boolean = true;
  errorMessage: string = "";
  loadingToggle:boolean=false;
  booleanForCode:boolean=false;

  successToggle:boolean=false;

  MPToggle:boolean=false;

  registerForm: FormGroup;
  loginForm: FormGroup;
  forgotPasswordGroup: FormGroup;
  resetPassword: FormGroup;
  pass: string;
  showConfirmSide: boolean = false;
  showPasswordReset: boolean = false;
  showLoader: boolean = false;
  showConfirmCodeForgote: boolean = false;
  emailSend: string;
  passwordForLogin: string;
  confirmCodeResponseResetPAssword: number;
  allowPassowrdChange: boolean = false;
  cheked: boolean = false;

  interval:any;
  timeLeft:number=10;
  showTimeLeft:boolean=true;

  langText = 'en'
  checkAM: boolean;
  checkRU: boolean;
  checkEN: boolean;

  date: Date;


  @ViewChild('container') container: any;
  @ViewChild('signIn') signIn: any;
  @ViewChild('rulesCheckBox') rules: any;
  @ViewChild('confirmAcc') confirmAcc: any;
  @Input() mainLogin: boolean;


  constructor(private auth:AuthPayxService,
    private loginService:LoginService,
    private router:Router,
    // private messagingService: MessagingService,

    private formBuilder: FormBuilder,private aRoute: ActivatedRoute,private translate: TranslateService,) { }

  ngOnInit() {
    this.date = new Date()
    if(localStorage.getItem('lang'))
    {
      localStorage.getItem('lang') == 'ru' ? this.langText = 'ru' : localStorage.getItem('lang') == 'am' ? this.langText = 'am' : 'en'
      this.checkAM = localStorage.getItem('lang') == 'am' ? true : false;
      this.checkRU = localStorage.getItem('lang') == 'ru' ? true : false;
      this.checkEN = localStorage.getItem('lang') == 'en' ? true : false;
      this.translate.use(localStorage.getItem('lang'))
    }
    else{
      this.translate.use('en')
    }

    if(localStorage.getItem('token'))
    {
      this.router.navigateByUrl('user/qr')
    }
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastname: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
      phoneNumber: ['', [Validators.required, Validators.minLength(8)]],
    });
    this.loginForm = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
    // this.messagingService.requestPermission();
    // this.messagingService.receiveMessage();
    // this.startTimer();
  }

  click(){
    let f=document.getElementsByClassName('front')[0] as HTMLElement;
    let b=document.getElementsByClassName('back')[0] as HTMLElement;
    f.classList.toggle('front-transform')
    b.classList.toggle('back-transform')
  }

  onSubBtnClick() {
    this.loginIsValid = true;
    if(this.login.password == "" || this.login.username == "")
    return
    if (this.router.url != "/adminLogin") {
      this.loginService.login(this.login).subscribe(
        (res) => {
          if (!this.loginService.isAuthenticated(res)) {
            this.errorMessage = "Incorrect username or password";
            this.loginIsValid = false;
            return;
          }
          this.loginService.saveSession(res);
          this.router.navigateByUrl("user/qr");
        },
        (err) => {
          if (err.status == 401 || err.status == 400) {
            this.errorMessage = err?.error?.message;
            this.loginIsValid = false;
          }
        }
      );
      return;
    }
    this.loginService.Authentify(this.login).subscribe(
      (res) => {
        localStorage.setItem("token", res.token ?? "");
        this.router.navigateByUrl("/admin/merchants");
      },
      (err) => {
        if (err.status == 401 || err.status == 400) {
          this.errorMessage = err?.error?.message;
          this.loginIsValid = false;
        }
      }
    );
  }



  register(){
    var user:User={
      id:-1,
      firstname:this.registerForm.get('firstName').value,
      lastname:this.registerForm.get('lastname').value,
      phone:this.registerForm.get('phoneNumber').value,
      password:this.registerForm.get('password').value
    }
    this.auth.register(user).subscribe(
      res=>{
        this.registerForm.disable()
        this.booleanForCode=true;
        this.startTimer();
        // this.router.navigateByUrl(`physical-user/activate?phone=${this.registerForm.get('phoneNumber').value}`);
      },
      err=>{

      }
    )
  }

  onCodeChanged(){

  }
  onCodeCompleted(event){
    this.auth.activateUser(this.registerForm.get('phoneNumber').value,event).subscribe(
      res=>{
        //
        this.successToggle=true;
      }
    )
  }

  isValid(){
    return (
    this.registerForm.get('firstName').valid &&
    this.registerForm.get('lastname').valid &&
    this.registerForm.get('password').valid &&
    this.registerForm.get('confirmPassword').valid &&
    this.registerForm.get('phoneNumber').valid &&
    this.registerForm.get('password').value==this.registerForm.get('confirmPassword').value)
  }

  isValidPass(){
    return  this.registerForm.get('password').value==this.registerForm.get('confirmPassword').value;
  }

  startTimer() {
    this.showTimeLeft=true;
    this.timeLeft=300;
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      }
       else {
        this.showTimeLeft = false;
        clearInterval(this.interval);
      }
    }, 1000);
  }

  getActivationCode(){
    this.auth.sendActivationCode(this.registerForm.get('phoneNumber').value).subscribe(
      res=>{
        this.startTimer();
      }
    )
  }

  getTimeLeft(){
    return new Date(this.timeLeft * 1000).toISOString().substr(14, 5);
  }

  onOkClick(){
    this.login.username=this.registerForm.get('phoneNumber').value;
    this.login.password=this.registerForm.get('password').value;
    this.onSubBtnClick();
  }


  // Rules
  clickCheckbox() {
    if (!this.cheked) this.rules['nativeElement'].click();
  }
  toggleEditable(event) {
    if (event.target.checked) {
      this.cheked = true;
    } else this.cheked = false;
  }

  rightPanelActive() {
    this.MPToggle=!this.MPToggle;
    this.container['nativeElement'].classList.add('right-panel-active');
  }

  rightPanelDective() {
    this.MPToggle=!this.MPToggle;
    this.container['nativeElement'].classList.remove('right-panel-active');
  }

  onFgBtnClick(){
    this.router.navigateByUrl('physical-user/forgot-password')
  }

  changeLang(lang: string){
    this.langText = lang
    this.checkAM = lang == 'am' ? true : false;
    this.checkRU = lang == 'ru' ? true : false;
    this.checkEN = lang == 'en' ? true : false;
    localStorage.setItem('lang', lang)
    this.translate.use(lang)
  }

}

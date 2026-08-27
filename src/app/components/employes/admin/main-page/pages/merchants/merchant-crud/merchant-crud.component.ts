import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Bank } from "src/app/models/bank.model";
import { Domain } from "src/app/models/domain.model";
import { Merchant } from "src/app/models/merchant.model";
import { MerchantArcaDetail } from "src/app/models/merchantArcaDetail.model";
import { MerchantGroup } from "src/app/models/merchantGroup.model";
import { MerchantInfo } from "src/app/models/merchantInfo.model";
import { MerchantPercent } from "src/app/models/merchantPercent.model";
import { BankService } from "src/app/services/bank.service";
import { MerchantService } from "src/app/services/merchant.service";
import { Location } from "@angular/common";
import { MatSnackBar } from "@angular/material/snack-bar";

function atLeastOneCurrency(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formArray = control as FormArray;
    return formArray.length > 0 ? null : { atLeastOneRequired: true };
  };
}

@Component({
  selector: "app-merchant-crud",
  templateUrl: "./merchant-crud.component.html",
  styleUrls: ["./merchant-crud.component.scss"],
})
export class MerchantCrudComponent implements OnInit {
  isNewMerchant: boolean;
  merchantGroup: boolean = false;
  showDomain: boolean = true;
  showBank: boolean = true;
  showGroups: boolean = true;
  showLoader: boolean = false;

  merchantInfo: FormGroup;
  newMerchant: Merchant = new Merchant();

  domains: Domain[] = [];
  currencies: {name: string; code: string}[] = [];

  banks: Bank[] = [];

  groups: MerchantGroup[] = [];

  profilePicBase64: string | ArrayBuffer;
  profilePic: string | ArrayBuffer;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private bankService: BankService,
    private merchantService: MerchantService,
    private location: Location,
    private _snackBar: MatSnackBar
  ) {
    this.newMerchant.merchantInfo = new MerchantInfo();
    this.newMerchant.merchantArcaDetails = new MerchantArcaDetail();
    this.newMerchant.merchantPercent = new MerchantPercent();
  }

  ngOnInit(): void {
    this.getDomains();
    this.getBanks();
    this.getCurrencies();
    // this.isNewMerchant = this.router.url.split('/')[3] == 'new-merchant'
    this.buildForm();
  }

  buildForm() {
    this.merchantInfo = this.formBuilder.group({
      companyNameEn: ["", [Validators.required]],
      companyNameHy: ["", [Validators.required]],
      companyNameRu: [""],
      logo: [""],
      addressEn: ["", [Validators.required]],
      addressHy: ["", [Validators.required]],
      legalCompanyName: ["", [Validators.required]],
      legalAddress: ["", [Validators.required]],
      tin: [""],
      phone: [""],
      bankSerialNumber: [""],
      website: [""],
      email: [""],
      smsPhone: [""],
      director: [""],
      payxToken: [""],
      bank: [[Validators.required]],
      domain: [[Validators.required]],
      mcc: ["", [Validators.required]],
      merchantArcaPercent: ["", [Validators.required]],
      merchantLocalPercent: ["", [Validators.required]],
      merchantOutPercent: ["", [Validators.required]],
      sphereOfActivity: [""],
      merchantGroup: [""],
      tidBinding: ["", [Validators.required]],
      bpcTidBindingPassword: ["", [Validators.required]],
      tidApi: ["", [Validators.required]],
      bpcTidApiPassword: ["", [Validators.required]],
      epgUsername: [""],
      epgPassword: [""],
      feeType: [1],
      merchantType: [1],
      isOffline: [false],
      isEpg: [false],
      bankInternalTid: [""],
      bankInternalMid: [""],
      status: [""],
      currencies: this.formBuilder.array([], [atLeastOneCurrency()])
    });

    this.merchantInfo.get("feeType").setValue(1);
    this.merchantInfo.get("merchantType").setValue(1);
    this.merchantInfo.get("status").setValue(0);

    this.setCurrencies();
  }

  get currenciesFormArray() {
    return this.merchantInfo.get('currencies') as FormArray;
  }

  setCurrencies() {
    this.merchantInfo.setControl(
      'currencies',
      this.formBuilder.array(['AMD'], [atLeastOneCurrency()])
    );
  }

  onCurrencyChange(code: string, isChecked: boolean) {
    const currenciesArray = this.currenciesFormArray;
    if (isChecked) {
      // Add currency code to FormArray if checked
      currenciesArray.push(this.formBuilder.control(code));
    } else {
      // Remove currency code from FormArray if unchecked
      const index = currenciesArray.controls.findIndex(control => control.value === code);
      if (index !== -1) {
        currenciesArray.removeAt(index);
      }
    }
  }

  setNewMerchant() {
    this.showLoader = true;
    this.newMerchant.payxToken = this.merchantInfo.get("payxToken").value;
    this.newMerchant.bankInternalMid =
      this.merchantInfo.get("bankInternalMid").value;
    this.newMerchant.bankInternalTid =
      this.merchantInfo.get("bankInternalTid").value;
    this.newMerchant.feeType = this.merchantInfo.get("feeType").value * 1;
    this.newMerchant.isOffline = this.merchantInfo.get("isOffline").value;
    this.newMerchant.isEpg = this.merchantInfo.get("isEpg").value;
    this.newMerchant.mcc = this.merchantInfo.get("mcc").value;
    if (this.merchantGroup) {
      this.newMerchant.merchantGroup =
        this.merchantInfo.get("merchantGroup").value * 1;
      this.newMerchant.merchantArcaDetails.merchantGroupId =
        this.merchantInfo.get("merchantGroup").value * 1;
    } else {
      this.newMerchant.merchantGroup = 0;
      this.newMerchant.merchantArcaDetails.merchantGroupId = 0;
    }
    this.newMerchant.merchantArcaDetails.bpcTidApiPassword =
      this.merchantInfo.get("bpcTidApiPassword").value;
    this.newMerchant.merchantArcaDetails.bpcTidBindingPassword =
      this.merchantInfo.get("bpcTidBindingPassword").value;
    this.newMerchant.merchantArcaDetails.tidApi =
      this.merchantInfo.get("tidApi").value;
    this.newMerchant.merchantArcaDetails.tidBinding =
      this.merchantInfo.get("tidBinding").value;

    this.newMerchant.merchantArcaDetails.epgUsername =
      this.merchantInfo.get("epgUsername").value;
    this.newMerchant.merchantArcaDetails.epgPassword =
      this.merchantInfo.get("epgPassword").value;

    this.newMerchant.merchantInfo.addressEn =
      this.merchantInfo.get("addressEn").value;
    this.newMerchant.merchantInfo.addressHy =
      this.merchantInfo.get("addressHy").value;
    this.newMerchant.merchantInfo.bankSerialNumber =
      this.merchantInfo.get("bankSerialNumber").value;
    this.newMerchant.merchantInfo.companyNameEn =
      this.merchantInfo.get("companyNameEn").value;
    this.newMerchant.merchantInfo.companyNameHy =
      this.merchantInfo.get("companyNameHy").value;
    this.newMerchant.merchantInfo.companyNameRu =
      this.merchantInfo.get("companyNameRu").value;
    this.newMerchant.merchantInfo.director =
      this.merchantInfo.get("director").value;
    this.newMerchant.merchantInfo.email =
      this.merchantInfo.get("email").value;
    this.newMerchant.merchantInfo.legalAddress =
      this.merchantInfo.get("legalAddress").value;
    this.newMerchant.merchantInfo.legalCompanyName =
      this.merchantInfo.get("legalCompanyName").value;
    this.newMerchant.merchantInfo.logo = this.merchantInfo.get("logo").value;
    this.newMerchant.merchantInfo.phone =
      this.merchantInfo.get("phone").value;
    this.newMerchant.merchantInfo.smsPhone =
      this.merchantInfo.get("smsPhone").value;
    this.newMerchant.merchantInfo.tin = this.merchantInfo.get("tin").value;
    this.newMerchant.merchantInfo.website =
      this.merchantInfo.get("website").value;
    this.newMerchant.merchantPercent.merchantArcaPercent =
      this.merchantInfo.get("merchantArcaPercent").value * 1;
    this.newMerchant.merchantPercent.merchantLocalPercent =
      this.merchantInfo.get("merchantLocalPercent").value * 1;
    this.newMerchant.merchantPercent.merchantOutPercent =
      this.merchantInfo.get("merchantOutPercent").value * 1;
    this.newMerchant.merchantType =
      this.merchantInfo.get("merchantType").value * 1;
    this.newMerchant.sphereOfActivity =
      this.merchantInfo.get("sphereOfActivity").value;
    this.newMerchant.status = this.merchantInfo.get("status").value * 1;
    this.newMerchant.currencies = this.merchantInfo.get("currencies").value;

    this.merchantService.addMerchant(this.newMerchant).subscribe(
      (res) => {
        this.showLoader = false;
        let mid = res.body["merchantId"];
        this.router.navigate([`admin/merchants/merchant-info`], {
          queryParams: { id: mid },
        });
      },
      (err) => {
        this.showLoader = false;
        let errmer = err?.error?.message;
        this._snackBar.open(errmer, "", {
          duration: 7000,
        });
      }
    );
  }

  getDomains() {
    this.showLoader = true;
    this.merchantService.getDomains().subscribe(
      (res) => {
        this.domains = res.items ?? [];
        this.showLoader = false;
      },
      (err) => {
        this.showLoader = false;
        let errmer = err?.error?.message;
        this._snackBar.open(errmer, "", {
          duration: 7000,
        });
      }
    );
  }

  getCurrencies() {
    this.showLoader = true;
    this.merchantService.getCurrencies().subscribe(
      (res) => {
        this.currencies = res.items ?? [];
        this.showLoader = false;
      },
      (err) => {
        this.showLoader = false;
        let errmer = err?.error?.message;
        this._snackBar.open(errmer, "", {
          duration: 7000,
        });
      }
    );
  }

  getBanks() {
    this.showLoader = true;
    this.bankService.getBanks().subscribe(
      (res) => {
        this.banks = res;
        if (this.banks.length == 0) {
          this._snackBar.open("Please enter bank", "", {
            duration: 7000,
          });
          this.showLoader = false;
          return;
        }
        this.showGroups = true;
        this.newMerchant.bank = this.banks[0];
        this.merchantInfo
          .get("bank")
          .setValue({ id: this.banks[0]?.id, title: this.banks[0]?.title });
        this.showLoader = false;
      },
      (err) => {
        this.showLoader = false;
        let errmer = err?.error?.message;
        this._snackBar.open(errmer, "", {
          duration: 7000,
        });
      }
    );
  }

  setBank(val) {
    this.showBank = false;
    this.showGroups = true;
    // this.merchantInfo.get('merchantGroup').setValue('')
    // this.merchantInfo.get('tidBinding').setValue('')
    // this.merchantInfo.get('bpcTidBindingPassword').setValue('')
    // this.merchantInfo.get('tidApi').setValue('')
    // this.merchantInfo.get('bpcTidApiPassword').setValue('')
    this.reset();
    let bank = this.banks.find((b) => b.id == val * 1);
    this.newMerchant.bank = bank;
    this.merchantInfo
      .get("bank")
      .setValue({ id: bank?.id, title: bank?.title });
  }

  setDomain(val) {
    this.showDomain = false;
    let domain = this.domains.find((d) => d.id == val * 1);
    this.newMerchant.domain = domain;
    this.merchantInfo
      .get("domain")
      .setValue({ id: domain?.id, title: domain?.title });
  }

  setGroup(val) {
    this.reset();
    this.showGroups = false;
    let group = this.groups.find((gr) => gr.id == val * 1);
    this.newMerchant.merchantGroup = group.id;
    this.merchantInfo
      .get("merchantGroup")
      .setValue(group?.id == undefined ? "not_set" : group?.id);
    this.merchantInfo
      .get("tidBinding")
      .setValue(
        group?.merchantArcaDetails?.tidBinding == undefined
          ? "not_set"
          : group?.merchantArcaDetails?.tidBinding
      );
    this.merchantInfo
      .get("bpcTidBindingPassword")
      .setValue(
        group?.merchantArcaDetails?.bpcTidBindingPassword == undefined
          ? "not_set"
          : group?.merchantArcaDetails?.bpcTidBindingPassword
      );
    this.merchantInfo
      .get("tidApi")
      .setValue(
        group?.merchantArcaDetails?.tidApi == undefined
          ? "not_set"
          : group?.merchantArcaDetails?.tidApi
      );
    this.merchantInfo
      .get("bpcTidApiPassword")
      .setValue(
        group?.merchantArcaDetails?.bpcTidApiPassword == undefined
          ? "not_set"
          : group?.merchantArcaDetails?.bpcTidApiPassword
      );
    for (
      let i = 0;
      i < document.getElementsByClassName("disabled").length;
      i++
    ) {
      document
        .getElementsByClassName("disabled")
        [i].setAttribute("disabled", "");
    }
    // this.merchantInfo.get('tidBinding').disable()
    // this.merchantInfo.get('bpcTidBindingPassword').disable()
    // this.merchantInfo.get('tidApi').disable()
    // this.merchantInfo.get('bpcTidApiPassword').disable()
  }

  checkBanks() {
    if (this.merchantGroup) {
      this.showGroups = true;
    }
    if (this.groups.length == 0) {
      this.merchantGroup = false;
    }
    if (!this.merchantGroup) {
      this.reset();
    }
  }

  reset() {
    for (
      let i = 0;
      i < document.getElementsByClassName("disabled").length;
      i++
    ) {
      document
        .getElementsByClassName("disabled")
        [i].setAttribute("disabled", "false");
    }
    this.merchantInfo.get("merchantGroup").setValue("");
    this.merchantInfo.get("tidBinding").setValue("");
    this.merchantInfo.get("bpcTidBindingPassword").setValue("");
    this.merchantInfo.get("tidApi").setValue("");
    this.merchantInfo.get("bpcTidApiPassword").setValue("");
  }

  uploadLogo(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.profilePicBase64 = reader.result;
      this.profilePic = this.profilePicBase64;
      let img = this.profilePic as string;
      img = img.replace(/^data:image\/[a-z]+;base64,/, "");
      this.newMerchant.merchantInfo.logo = img;
      this.merchantInfo.get("logo").setValue(img);
    };
    reader.readAsDataURL(file);
  }

  cancelBtn() {
    this.location.back();
  }
}

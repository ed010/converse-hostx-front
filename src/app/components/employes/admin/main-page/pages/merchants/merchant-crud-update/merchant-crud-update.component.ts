import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Bank } from "src/app/models/bank.model";
import { Domain } from "src/app/models/domain.model";
import { Merchant } from "src/app/models/merchant.model";
import { MerchantArcaDetail } from "src/app/models/merchantArcaDetail.model";
import { MerchantGroup } from "src/app/models/merchantGroup.model";
import { MerchantInfo } from "src/app/models/merchantInfo.model";
import { MerchantPercent } from "src/app/models/merchantPercent.model";
import { BankService } from "src/app/services/bank.service";
import { MerchantService } from "src/app/services/merchant.service";
import { MerchantGroupService } from "src/app/services/merchantGroup.service";
import { Location } from "@angular/common";
import { MatSnackBar } from "@angular/material/snack-bar";

function atLeastOneCurrency(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formArray = control as FormArray;
    return formArray.length > 0 ? null : { atLeastOneRequired: true };
  };
}

@Component({
  selector: "app-merchant-crud-update",
  templateUrl: "./merchant-crud-update.component.html",
  styleUrls: ["./merchant-crud-update.component.scss"],
})
export class MerchantCrudUpdateComponent implements OnInit {
  isNewMerchant: boolean;
  merchantGroup: boolean = false;
  showDomain: boolean = true;
  showBank: boolean = true;
  showGroups: boolean = true;
  merchantID: number;
  showLoader: boolean = false;

  merchantInfo: FormGroup;
  newMerchant: Merchant = new Merchant();

  domains: Domain[] = [];

  banks: Bank[] = [];

  groups: MerchantGroup[] = [];

  generatedToken: string;

  currencies: {name: string; code: string}[] = [];


  profilePicBase64: string | ArrayBuffer;
  profilePic: string | ArrayBuffer;
  currentLogoPreview: string | null = null;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private bankService: BankService,
    private merchantService: MerchantService,
    private merchantGroupService: MerchantGroupService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private _snackBar: MatSnackBar
  ) {
    this.newMerchant.merchantInfo = new MerchantInfo();
    this.newMerchant.merchantArcaDetails = new MerchantArcaDetail();
    this.newMerchant.merchantPercent = new MerchantPercent();
  }

  ngOnInit(): void {
    this.getCurrencies();
    this.activatedRoute.queryParams.subscribe(
      (res) => {
        this.merchantID = parseInt(res["id"]);
        this.getMerchantInfo(this.merchantID);
      },
      (err) => {
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

  getMerchantInfo(id: number) {
    this.showLoader = true;
    this.merchantService.getMerchantById(id).subscribe(
      (res) => {
        this.newMerchant = res.body as Merchant;
        this.merchantGroup =
          this.newMerchant.merchantArcaDetails.merchantGroupId == 0
            ? false
            : true;
        this.getDomains();
        this.buildForm();
        if (this.merchantGroup) {
          this.getGroups(this.newMerchant.bank.id);
        }
      },
      (err) => {
        this.showLoader = false;
        this.router.navigate([`admin/merchants/merchant-info`], {
          queryParams: { id: this.merchantID },
        });

        let errmer = err?.error?.message;
        this._snackBar.open(errmer, "", {
          duration: 7000,
        });
      }
    );
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
      mcc: [""],
      merchantArcaPercent: ["", [Validators.required]],
      merchantLocalPercent: ["", [Validators.required]],
      merchantOutPercent: ["", [Validators.required]],
      merchantGroup: [""],
      tidBinding: ["", [Validators.required]],
      bpcTidBindingPassword: ["", [Validators.required]],
      epgUsername: [""],
      epgPassword: [""],
      tidApi: ["", [Validators.required]],
      bpcTidApiPassword: ["", [Validators.required]],
      feeType: [1],
      merchantType: [1],
      isOffline: [false],
      isEpg: [false],
      bankInternalTid: [""],
      bankInternalMid: [""],
      status: [""],
      sphereOfActivity: [""],
      currencies: this.formBuilder.array([], [atLeastOneCurrency()])
      
    });

    this.merchantInfo.get("feeType").setValue(this.newMerchant?.feeType);
    this.merchantInfo
      .get("merchantType")
      .setValue(this.newMerchant?.merchantType);
    this.merchantInfo.get("status").setValue(this.newMerchant?.status);
    this.merchantInfo
      .get("companyNameEn")
      .setValue(this.newMerchant?.merchantInfo?.companyNameEn);
    this.merchantInfo
      .get("companyNameHy")
      .setValue(this.newMerchant?.merchantInfo?.companyNameHy);
    this.merchantInfo
      .get("companyNameRu")
      .setValue(this.newMerchant?.merchantInfo?.companyNameRu);
    this.merchantInfo
      .get("addressEn")
      .setValue(this.newMerchant?.merchantInfo?.addressEn);
    this.merchantInfo
      .get("addressHy")
      .setValue(this.newMerchant?.merchantInfo?.addressHy);
    this.merchantInfo
      .get("bankSerialNumber")
      .setValue(this.newMerchant?.merchantInfo?.bankSerialNumber);
    this.merchantInfo
      .get("director")
      .setValue(this.newMerchant?.merchantInfo?.director);
    this.merchantInfo
      .get("email")
      .setValue(this.newMerchant?.merchantInfo?.email);
    this.merchantInfo
      .get("legalAddress")
      .setValue(this.newMerchant?.merchantInfo?.legalAddress);
    this.merchantInfo
      .get("legalCompanyName")
      .setValue(this.newMerchant?.merchantInfo?.legalCompanyName);
    this.merchantInfo.get("logo").setValue(this.newMerchant.merchantInfo.logo);
    this.currentLogoPreview = this.resolveLogoUrl(
      this.newMerchant.merchantInfo.logo
    );
    this.merchantInfo
      .get("phone")
      .setValue(this.newMerchant?.merchantInfo?.phone?.replace("+374", ""));
    this.merchantInfo
      .get("smsPhone")
      .setValue(this.newMerchant?.merchantInfo?.smsPhone?.replace("+374", ""));
    this.merchantInfo.get("tin").setValue(this.newMerchant?.merchantInfo?.tin);
    this.merchantInfo
      .get("website")
      .setValue(this.newMerchant?.merchantInfo?.website);
    this.merchantInfo
      .get("bankInternalMid")
      .setValue(this.newMerchant.bankInternalMid);
    this.merchantInfo
      .get("bankInternalTid")
      .setValue(this.newMerchant.bankInternalTid);
    this.merchantInfo.get("domain").setValue(this.newMerchant.domain.id);
    this.merchantInfo.get("bank").setValue(this.newMerchant.bank.id);
    this.merchantInfo.get("isOffline").setValue(this.newMerchant.isOffline);
    this.merchantInfo.get("isEpg").setValue(this.newMerchant.isEpg);
    this.merchantInfo.get("mcc").setValue(this.newMerchant.mcc);
    this.merchantInfo
      .get("bpcTidApiPassword")
      .setValue(this.newMerchant.merchantArcaDetails.bpcTidApiPassword);
    this.merchantInfo
      .get("bpcTidBindingPassword")
      .setValue(this.newMerchant.merchantArcaDetails.bpcTidBindingPassword);
    this.merchantInfo
      .get("tidApi")
      .setValue(this.newMerchant.merchantArcaDetails.tidApi);
    this.merchantInfo
      .get("tidBinding")
      .setValue(this.newMerchant.merchantArcaDetails.tidBinding);

    this.merchantInfo
      .get("epgUsername")
      .setValue(this.newMerchant.merchantArcaDetails.epgUsername);
    this.merchantInfo
      .get("epgPassword")
      .setValue(this.newMerchant.merchantArcaDetails.epgPassword);

    if (this.merchantGroup)
      this.merchantInfo
        .get("merchantGroup")
        .setValue(this.newMerchant.merchantArcaDetails.merchantGroupId);
    this.merchantInfo.get("payxToken").setValue(this.newMerchant?.payxToken);
    this.merchantInfo
      .get("merchantArcaPercent")
      .setValue(this.newMerchant?.merchantPercent.merchantArcaPercent);
    this.merchantInfo
      .get("merchantLocalPercent")
      .setValue(this.newMerchant?.merchantPercent.merchantLocalPercent);
    this.merchantInfo
      .get("merchantOutPercent")
      .setValue(this.newMerchant?.merchantPercent.merchantOutPercent);
    this.merchantInfo
      .get("sphereOfActivity")
      .setValue(this.newMerchant?.sphereOfActivity);

    const merchantCurrencies = this.newMerchant?.currencies ?? ['AMD']; // Default to ['AMD'] if no currencies
    this.merchantInfo.setControl(
      'currencies',
      this.formBuilder.array(merchantCurrencies, [atLeastOneCurrency()])
    );
  }

  get currenciesFormArray() {
    return this.merchantInfo.get('currencies') as FormArray;
  }

  onCurrencyChange(code: string, isChecked: boolean) {
    const currenciesArray = this.currenciesFormArray;
    if (isChecked) {
      currenciesArray.push(this.formBuilder.control(code));
    } else {
      const index = currenciesArray.controls.findIndex(control => control.value === code);
      if (index !== -1) {
        currenciesArray.removeAt(index);
      }
    }
    currenciesArray.markAsTouched();
  }

  setNewMerchant() {
    this.showLoader = true;
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
    this.newMerchant.merchantInfo.email = this.merchantInfo.get("email").value;
    this.newMerchant.merchantInfo.legalAddress =
      this.merchantInfo.get("legalAddress").value;
    this.newMerchant.merchantInfo.legalCompanyName =
      this.merchantInfo.get("legalCompanyName").value;
    this.newMerchant.merchantInfo.logo = this.merchantInfo.get("logo").value;
    this.newMerchant.merchantInfo.phone = this.merchantInfo.get("phone").value;
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
    this.newMerchant.status = this.merchantInfo.get("status").value * 1;
    this.newMerchant.sphereOfActivity =
      this.merchantInfo.get("sphereOfActivity").value;

    this.newMerchant.merchantArcaDetails.id = -1;

    this.newMerchant.currencies = this.merchantInfo.get('currencies').value;

    this.merchantService.updateMerchant(this.newMerchant).subscribe(
      (res) => {
        this.showLoader = false;
        this.router.navigate([`admin/merchants/merchant-info`], {
          queryParams: { id: this.merchantID },
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

  getBanks() {
    this.showLoader = true;
    this.bankService.getBanks().subscribe(
      (res) => {
        this.banks = res;
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

  getGroups(id: number) {
    this.showLoader = true;
    this.merchantGroupService.getMerchantGroupsByBank(id).subscribe(
      (res) => {
        this.groups = res.body as MerchantGroup[];
        this.showLoader = false;
        if (this.groups.length === 0) {
          this.merchantGroup = false;
          this.reset();
        }
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
    this.reset();
    let bank = this.banks.find((b) => b.id == val * 1);
    this.getGroups(bank?.id);
    this.newMerchant.bank = bank;
    // this.merchantInfo.get('bank').setValue({'id': bank?.id, 'title': bank?.title})
  }

  setDomain(val) {
    this.showDomain = false;
    let domain = this.domains.find((d) => d.id == val * 1);
    this.newMerchant.domain = domain;
    // this.merchantInfo.get('domain').setValue({'id': domain?.id, 'title': domain?.title})
  }

  setGroup(val) {
    this.reset();
    this.showGroups = false;
    let group = this.groups.find((gr) => gr.id == val * 1);
    this.newMerchant.merchantGroup = group.id;
    this.merchantInfo
      .get("merchantGroup")
      .setValue(group?.id == undefined ? "notset" : group?.id);
    this.merchantInfo
      .get("tidBinding")
      .setValue(
        group?.merchantArcaDetails?.tidBinding == undefined
          ? "notset"
          : group?.merchantArcaDetails?.tidBinding
      );
    this.merchantInfo
      .get("bpcTidBindingPassword")
      .setValue(
        group?.merchantArcaDetails?.bpcTidBindingPassword == undefined
          ? "notset"
          : group?.merchantArcaDetails?.bpcTidBindingPassword
      );
    this.merchantInfo
      .get("tidApi")
      .setValue(
        group?.merchantArcaDetails?.tidApi == undefined
          ? "notset"
          : group?.merchantArcaDetails?.tidApi
      );
    this.merchantInfo
      .get("bpcTidApiPassword")
      .setValue(
        group?.merchantArcaDetails?.bpcTidApiPassword == undefined
          ? "notset"
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
  }

  checkBanks() {
    if (this.merchantGroup) {
      this.showGroups = true;
      if (this.groups.length === 0) {
        this.getGroups(this.newMerchant.bank.id);
        return;
      }
    } else {
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
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.profilePicBase64 = reader.result;
      this.profilePic = this.profilePicBase64;
      this.currentLogoPreview = this.profilePic as string;
      let img = this.profilePic as string;
      img = img.replace(/^data:image\/[a-z]+;base64,/, "");
      this.newMerchant.merchantInfo.logo = img;
      this.merchantInfo.get("logo").setValue(img);
    };
    reader.readAsDataURL(file);
  }

  private resolveLogoUrl(logo?: string | null): string | null {
    const value = logo?.trim();
    if (!value) {
      return null;
    }
    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("data:")
    ) {
      return value;
    }
    return `data:image/png;base64,${value}`;
  }

  cancelBtn() {
    this.location.back();
  }
}

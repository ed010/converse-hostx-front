import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { RegisterApplePayModel } from "src/app/models/apple-pay/RegisterApplePay.model";
import { Merchant } from "src/app/models/merchant.model";
import { MerchantGroup } from "src/app/models/merchantGroup.model";
import {
  MerchantUser,
  normalizeArmenianPhoneNumber,
} from "src/app/models/merchantUser.model";
import { ApplePayService } from "src/app/services/applePay.service";
import { MerchantService } from "src/app/services/merchant.service";
import { MerchantGroupService } from "src/app/services/merchantGroup.service";
import { MerchantUserService } from "src/app/services/merchantUser.service";

/** Map API user JSON (e.g. `canGenerateQr`) to template / PUT body field names (`canGenerateQR`). */
function normalizeMerchantUserRow(raw: any): MerchantUser {
  if (!raw || typeof raw !== "object") {
    return raw as MerchantUser;
  }
  return {
    ...raw,
    merchantUserId: String(raw.merchantUserId ?? raw.id ?? ""),
    canGenerateQR: !!(raw.canGenerateQR ?? raw.canGenerateQr ?? raw.showQr),
    canGenerateMultiQR: !!(raw.canGenerateMultiQR ?? raw.canGenerateMulti),
    isBlocked: !!raw.isBlocked,
  } as MerchantUser;
}

@Component({
  selector: "app-mercahnt-info",
  templateUrl: "./mercahnt-info.component.html",
  styleUrls: ["./mercahnt-info.component.scss"],
})
export class MercahntInfoComponent implements OnInit, OnDestroy {
  merchantID: number;
  merchant: Merchant;
  user: MerchantUser = new MerchantUser();

  editingUserId: string | null = null;
  editingField: "username" | "password" | "phoneNumber" | null = null;
  editingValue: string = "";

  users: MerchantUser[] = [];
  groups: MerchantGroup[] = [];

  registerMerchantApplePayFormGroup: FormGroup;

  registerMerchantDialog: any;

  disableMerchantDelete: boolean = true;
  merchantGroupName: string = "";
  isMerchantGroup: boolean;

  @ViewChild("mainUserModal") mainUserModal: ElementRef;
  @ViewChild("closeUserModal") closeUserModal: ElementRef;
  @ViewChild("allusersmodal") allusersmodal: ElementRef;

  constructor(
    private activatedRoute: ActivatedRoute,
    private merchantService: MerchantService,
    private router: Router,
    private userService: MerchantUserService,
    private merchantGroupService: MerchantGroupService,
    private applePayService: ApplePayService,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
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

  getMerchantInfo(id: number) {
    this.merchantService.getMerchantById(id).subscribe(
      (res) => {
        this.merchant = res.body as Merchant;
        this.isMerchantGroup =
          this.merchant.merchantArcaDetails.merchantGroupId != 0 ? true : false;
        this.getUsers(id);
        this.disableMerchantDelete = this.merchant.status == 2 ? false : true;
        if (this.isMerchantGroup) {
          this.getGroup(this.merchant.merchantArcaDetails.merchantGroupId);
        }
      },
      (err) => {
        let errmer = err?.error?.message;
        this._snackBar.open(errmer, "", {
          duration: 7000,
        });
      }
    );
  }

  changeCommentEdit(e) {
    let updateMerchant: Merchant = this.merchant;
    updateMerchant.canChangeComment = e.target.checked;
    this.merchantService.updateMerchant(updateMerchant).subscribe(
      (res) => {},
      (err) => {
        let errmer = err?.error?.message;
        this._snackBar.open(errmer, "", {
          duration: 7000,
        });
      }
    );
  }

  changeEPGStatus(e) {
    let updateMerchant: Merchant = this.merchant;
    updateMerchant.isEpg = e.target.checked;
    this.merchantService.updateMerchant(updateMerchant).subscribe(
      (res) => {},
      (err) => {
        let errmer = err?.error?.message;
        this._snackBar.open(errmer, "", {
          duration: 7000,
        });
      }
    );
  }

  getUsers(id: number) {
    this.userService.getUsersByMerchant(id).subscribe(
      (res) => {
        const body = res.body as any[] | null;
        this.users = Array.isArray(body)
          ? body.map((u) => normalizeMerchantUserRow(u))
          : [];
      },
      (err) => {
        let errmer = err?.error?.message;
        this._snackBar.open(errmer, "", {
          duration: 7000,
        });
      }
    );
  }

  updateUser(user: MerchantUser) {
    this.userService.updateUser(user).subscribe(
      (res) => {
        // Merge the server response into the same object instead of reloading
        // the whole list, so the cards don't get re-rendered from scratch.
        const payload = (res as any)?.body;
        if (
          payload &&
          typeof payload === "object" &&
          (payload.merchantUserId != null || payload.id != null)
        ) {
          Object.assign(user, normalizeMerchantUserRow(payload));
        }
      },
      (err) => {
        // Revert the optimistic local change by reloading actual data.
        this.getUsers(this.merchantID);
        let errmer = err?.error?.message;
        this._snackBar.open(errmer, "", {
          duration: 7000,
        });
      }
    );
  }

  trackByUser(index: number, user: MerchantUser) {
    return user.merchantUserId;
  }

  isEditing(
    user: MerchantUser,
    field: "username" | "password" | "phoneNumber"
  ): boolean {
    return (
      this.editingUserId === user.merchantUserId && this.editingField === field
    );
  }

  startEdit(
    user: MerchantUser,
    field: "username" | "password" | "phoneNumber"
  ) {
    this.editingUserId = user.merchantUserId;
    this.editingField = field;
    // Never prefill the password; the user types a brand new one
    this.editingValue = field === "password" ? "" : user[field] ?? "";
  }

  cancelEdit() {
    this.editingUserId = null;
    this.editingField = null;
    this.editingValue = "";
  }

  saveEdit(user: MerchantUser) {
    if (!this.editingField) return;
    user[this.editingField] =
      this.editingField === "phoneNumber"
        ? normalizeArmenianPhoneNumber(this.editingValue)
        : this.editingValue;
    this.updateUser(user);
    this.cancelEdit();
  }

  deleteUser(id) {
    this.userService.disableMerchantUser(id).subscribe(
      (res) => {
        const index = this.users.findIndex((u) => u.merchantUserId == id);
        const payload = (res as any)?.body ?? res;
        if (index >= 0 && payload) {
          this.users[index] = normalizeMerchantUserRow(payload);
        }
      },
      (err) => {
        let errmer = err?.error?.message;
        this._snackBar.open(errmer, "", {
          duration: 7000,
        });
      }
    );
  }

  changeStatus(val) {
    this.merchantService
      .cahngeMerchantStatus(this.merchant.merchantId, val * 1)
      .subscribe(
        (res) => {
          this.merchant.status = val * 1;
          this.disableMerchantDelete = val * 1 == 2 ? false : true;
        },
        (err) => {
          let errmer = err?.error?.message;
          this._snackBar.open(errmer, "", {
            duration: 7000,
          });
        }
      );
  }

  disableMerchant() {
    if (this.merchant.status == 2) return;
    this.merchantService.deactivateMerchant(this.merchantID).subscribe(
      (res) => {
        // this.router.navigateByUrl("/admin/merchants?page=1")
      },
      (err) => {
        let errmer = err?.error?.message;
        this._snackBar.open(errmer, "", {
          duration: 7000,
        });
      }
    );
  }

  updatePage() {
    this.router.navigateByUrl(
      `admin/merchants/update-merchant?id=${this.merchantID}`
    );
  }

  closeMainUserModal() {
    this.mainUserModal.nativeElement.click();
  }

  getGroup(id: number) {
    this.merchantGroupService
      .getMerchantGroupsByBank(this.merchant.bank.id)
      .subscribe(
        (res) => {
          this.groups = res.body as MerchantGroup[];
          this.merchantGroupName = this.groups.find(
            (gr) => gr.merchantArcaDetails.merchantGroupId == id
          )?.merchantGroupName;
        },
        (err) => {
          let errmer = err?.error?.message;
          this._snackBar.open(errmer, "", {
            duration: 7000,
          });
        }
      );
  }

  newUser() {
    const merchantTitle =
      this.merchant?.merchantInfo?.companyNameEn ??
      this.merchant?.merchantInfo?.companyNameHy ??
      "";
    this.userService
      .addUser(this.merchantID, merchantTitle, this.user)
      .subscribe(
      (res) => {
        this.getUsers(this.merchantID);
        this.user = new MerchantUser();
        this.closeUserModal.nativeElement.click();
        // this.allusersmodal.nativeElement.click()
      },
      (err) => {
        let errmer = err?.error?.message;
        this._snackBar.open(errmer, "", {
          duration: 7000,
        });
      }
    );
  }

  openRegisterMerchantDialog(templateRef) {
    this.registerMerchantApplePayFormGroup = this.fb.group({
      encryptTo: [null, [Validators.required]],
      domainNames: [[], [Validators.required]],
      MerchantId: [this.merchantID.toString()],
      partnerMerchantName: [
        this.merchant.merchantInfo.companyNameEn,
        [Validators.required],
      ],
    });
    this.registerMerchantDialog = this.dialog.open(templateRef, {
      width: "40%",
    });
  }

  registerMerchantToApplePay() {
    let registerMerchantApplePayBody: RegisterApplePayModel = {
      domainNames: (
        this.registerMerchantApplePayFormGroup.get("domainNames")
          .value as string
      )
        .trim()
        .split(" "),
      MerchantId:
        this.registerMerchantApplePayFormGroup.get("MerchantId").value,
      partnerMerchantName: this.registerMerchantApplePayFormGroup.get(
        "partnerMerchantName"
      ).value,
    };
    if (this.registerMerchantApplePayFormGroup.get("encryptTo").value) {
      registerMerchantApplePayBody.encryptTo =
        this.registerMerchantApplePayFormGroup.get("encryptTo").value;
    }
    this.applePayService
      .registerMerchant(registerMerchantApplePayBody)
      .subscribe((res) => {
        this.registerMerchantDialog.close();
      });
  }

  ngOnDestroy(): void {
    this.mainUserModal.nativeElement?.click();
    this.closeUserModal?.nativeElement.click();
    // this.allusersmodal?.nativeElement.click()
  }
}

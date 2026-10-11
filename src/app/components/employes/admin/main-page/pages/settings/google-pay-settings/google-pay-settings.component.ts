import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GooglePaySettings } from 'src/app/models/google-pay/google-pay.model';
import { GooglePayService } from 'src/app/services/googlePay.service';

/** Admin settings page for Google Pay (web): environment, Google merchant ID, gateway, networks, auth methods. */
@Component({
  selector: 'app-google-pay-settings',
  templateUrl: './google-pay-settings.component.html',
  styleUrls: ['./google-pay-settings.component.scss'],
})
export class GooglePaySettingsComponent implements OnInit {
  settings: GooglePaySettings | null = null;
  loading = false;
  saving = false;

  constructor(private googlePayService: GooglePayService, private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.googlePayService.getSettings().subscribe(
      (res) => {
        this.settings = res;
        this.loading = false;
      },
      (err) => {
        this.loading = false;
        this.showError(err);
      }
    );
  }

  isSelected(list: string[], value: string): boolean {
    return list.includes(value);
  }

  toggle(list: string[], value: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const index = list.indexOf(value);
    if (checked && index < 0) {
      list.push(value);
    } else if (!checked && index >= 0) {
      list.splice(index, 1);
    }
  }

  save(): void {
    const s = this.settings;
    if (!s) {
      return;
    }
    const request = {
      environment: s.environment,
      merchantId: (s.merchantId ?? '').trim(),
      gateway: (s.gateway ?? '').trim(),
      allowedCardNetworks: s.allowedCardNetworks,
      allowedAuthMethods: s.allowedAuthMethods,
      countryCode: (s.countryCode ?? '').trim(),
    };
    if (request.environment === 'PRODUCTION' && !request.merchantId) {
      this._snackBar.open('Google merchant ID is required for PRODUCTION.', '', { duration: 5000 });
      return;
    }
    if (!request.allowedCardNetworks.length || !request.allowedAuthMethods.length) {
      this._snackBar.open('Select at least one card network and one auth method.', '', { duration: 5000 });
      return;
    }
    this.saving = true;
    this.googlePayService.updateSettings(request).subscribe(
      (saved) => {
        this.settings = saved;
        this.saving = false;
        this._snackBar.open('Google Pay settings saved.', '', { duration: 4000 });
      },
      (err) => {
        this.saving = false;
        this.showError(err);
      }
    );
  }

  private showError(err: any): void {
    const message = err?.error?.errorMessage ?? err?.error?.message ?? err?.message ?? 'Request failed';
    this._snackBar.open(message, '', { duration: 7000 });
  }
}

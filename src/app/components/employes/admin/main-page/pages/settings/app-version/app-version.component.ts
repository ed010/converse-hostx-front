import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppVersionSettings, MobilePlatform } from 'src/app/models/app-version.model';
import { AppVersionService } from 'src/app/services/app-version.service';

/** Admin settings page for the mobile apps' latest / minimum versions, edited separately per platform. */
@Component({
  selector: 'app-app-version',
  templateUrl: './app-version.component.html',
  styleUrls: ['./app-version.component.scss'],
})
export class AppVersionComponent implements OnInit {
  versions: AppVersionSettings[] = [];
  loading = false;
  saving: MobilePlatform | null = null;

  readonly platformLabels: Record<MobilePlatform, string> = { Android: 'Android', Ios: 'iOS' };

  constructor(private appVersionService: AppVersionService, private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.appVersionService.getAppVersions().subscribe(
      (res) => {
        this.versions = res ?? [];
        this.loading = false;
      },
      (err) => {
        this.loading = false;
        this.showError(err);
      }
    );
  }

  save(version: AppVersionSettings): void {
    const request = {
      latestVersion: (version.latestVersion ?? '').trim(),
      minRequiredVersion: (version.minRequiredVersion ?? '').trim(),
      storeUrl: (version.storeUrl ?? '').trim(),
    };
    if (!request.latestVersion || !request.minRequiredVersion || !request.storeUrl) {
      this._snackBar.open('All fields are required.', '', { duration: 5000 });
      return;
    }
    this.saving = version.platform;
    this.appVersionService.updateAppVersion(version.platform, request).subscribe(
      (saved) => {
        Object.assign(version, saved);
        this.saving = null;
        this._snackBar.open(`${this.platformLabels[version.platform]} version saved.`, '', { duration: 4000 });
      },
      (err) => {
        this.saving = null;
        this.showError(err);
      }
    );
  }

  private showError(err: any): void {
    const message = err?.error?.errorMessage ?? err?.error?.message ?? err?.message ?? 'Request failed';
    this._snackBar.open(message, '', { duration: 7000 });
  }
}

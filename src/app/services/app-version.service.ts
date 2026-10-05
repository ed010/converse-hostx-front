import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppVersionRequest, AppVersionSettings, MobilePlatform } from '../models/app-version.model';

@Injectable({ providedIn: 'root' })
export class AppVersionService {
  constructor(private http: HttpClient) {}

  getAppVersions() {
    return this.http.get<AppVersionSettings[]>(`/api/Version/GetAppVersions`);
  }

  updateAppVersion(platform: MobilePlatform, request: AppVersionRequest) {
    return this.http.put<AppVersionSettings>(`/api/Version/UpdateAppVersion/${platform.toLowerCase()}`, request);
  }
}

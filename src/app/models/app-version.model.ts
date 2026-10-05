export type MobilePlatform = 'Android' | 'Ios';

export interface AppVersionSettings {
  platform: MobilePlatform;
  /** Installs below this get an optional update prompt. */
  latestVersion: string;
  /** Installs below this must update before using the app. */
  minRequiredVersion: string;
  storeUrl: string;
}

export interface AppVersionRequest {
  latestVersion: string;
  minRequiredVersion: string;
  storeUrl: string;
}

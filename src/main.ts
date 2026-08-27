import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";

export function getBaseUrl() {
  return document.getElementsByTagName("base")[0].href;
}

const providers = [{ provide: "BASE_URL", useFactory: getBaseUrl, deps: [] }];

if (environment.production) {
}

// enableProdMode();
// window.console.log(
//   "%cStop! This browser feature is intended for developers. If someone told you to copy and paste something here to enable the Converse feature or 'hack' someone's account, they are scammers. By following these steps, you will give them access to your account",
//   "color:red; font-size:30px; font-weight:bold"
// );
// window.console.log = () => {};
// window.console.warn = () => {};
// window.console.error = () => {};
// window.console.info = () => {};
// window.console.assert = () => {};

platformBrowserDynamic(providers)
  .bootstrapModule(AppModule)
  .catch((err) => console.log(err));

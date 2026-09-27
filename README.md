# AdPage

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.1.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Production deployment

The build is deployed **standalone** on `pay.conversebank.am` and calls the API on its own host
(`payapi.conversebank.am`) cross-origin. `environment.prod.ts` pins that host in `apiBaseUrl`; every
`HttpClient` call is prefixed by `BaseUrlInterceptor` and `SignalRService` builds the `/orderHub` URL
from the same value. The API no longer serves this app.

```bash
NODE_OPTIONS=--openssl-legacy-provider npx ng build --prod   # -> dist/ad-page/ (flag needed for Angular 11 on Node >= 17)
```

Hand `dist/ad-page/` to the web server. Two things it must do (sysadmin side — see
`ConverseRefactor/docs/DEPLOYMENT.md`):

- rewrite any unmatched path to `index.html`, so Angular routes resolve;
- answer 200 on `/.well-known/apple-developer-merchantid-domain-association` — Apple validates the
  domain that starts the payment session, i.e. this host. The content is what the API serves at that
  same path; proxying it to the API or hosting a copy both work. Apple Pay breaks without it.

If the API host ever changes, update `apiBaseUrl` in `src/environments/environment.prod.ts` and rebuild.
Local development (`ng serve` on 4200) uses `environment.ts` with `apiBaseUrl: "http://localhost:5018"`.

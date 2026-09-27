export const environment = {
  production: true,
  // The Angular app is served by nginx on its own host (pay.conversebank.am); the API lives on
  // payapi.conversebank.am. Every HttpClient call is prefixed with this by BaseUrlInterceptor, and
  // SignalRService builds the /orderHub URL from it. No trailing slash.
  apiBaseUrl: "https://payapi.conversebank.am",
};

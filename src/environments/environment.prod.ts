export const environment = {
  production: true,
  // Empty = same-origin. The build is served by the API itself (ConverseRefactor Spa:RootPath),
  // so the app calls the host it was loaded from: localhost:5018 in dev, payapi.conversebank.am
  // in production — one build for every environment. Set an absolute URL only if the SPA is ever
  // served from a different host than the API again.
  apiBaseUrl: "",
};

export const environment = {
  production: true,
  // Production API host. The SPA is served by this same API (ConverseRefactor Spa:RootPath), so
  // same-origin ("") would resolve to the same place, but the host is pinned explicitly so the
  // build calls https://pay.conversebank.am no matter where a copy of it is opened from.
  apiBaseUrl: "https://pay.conversebank.am",
};

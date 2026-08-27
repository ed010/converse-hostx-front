/**
 * Pay API often returns formUrl / redirectUrl pointing at the deployed frontend
 * (e.g. https://payx-test.comversebank.am/400?...). When developing on localhost,
 * rewrite those app routes onto the current origin; leave bank/ACS URLs alone.
 */
export function resolvePaymentRedirectUrl(rawUrl: string | null | undefined): string | null {
  if (rawUrl == null) {
    return null;
  }
  const trimmed = String(rawUrl).trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed, window.location.origin);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const isAppRoute =
      path === "/400" ||
      path.startsWith("/transfer_success") ||
      path.startsWith("/transfer_failed") ||
      path.startsWith("/px_transfer") ||
      path.startsWith("/pxtransfer") ||
      path.startsWith("/transaction-not-found");

    if (!isAppRoute) {
      return trimmed;
    }

    const host = url.hostname.toLowerCase();
    const isKnownFrontendHost =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.endsWith("conversebank.am") ||
      host.endsWith("comversebank.am") ||
      host.endsWith("payx.am");

    if (!isKnownFrontendHost && url.origin !== window.location.origin) {
      return trimmed;
    }

    return `${window.location.origin}${url.pathname}${url.search}${url.hash}`;
  } catch {
    return trimmed;
  }
}

/**
 * The only URL data allowed to leave the browser (analytics, error reports):
 * the path, plus routine settings on /session. Every other query param and the
 * hash are dropped, so a stray email or token in a link is never sent anywhere.
 */
const SESSION_PARAMS = new Set(["d", "l", "f", "i", "s", "p"]);

export function privateUrl(href: string, base = "https://www.bestfittips.com"): string {
  try {
    const isAbsolute = /^[a-z][a-z0-9+.-]*:/i.test(href);
    const url = new URL(href, base);
    const kept = new URLSearchParams();
    if (url.pathname === "/session") {
      url.searchParams.forEach((value, key) => {
        if (SESSION_PARAMS.has(key)) kept.set(key, value);
      });
    }
    url.search = kept.toString();
    url.hash = "";
    return isAbsolute ? url.toString() : `${url.pathname}${url.search}`;
  } catch {
    return "[unparseable url]";
  }
}

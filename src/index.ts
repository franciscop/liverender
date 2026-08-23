import parse from "./parse";
import { patch } from "./patch";

export function findRefresh(el: Element): number | null {
  const value = el.getAttribute("data-refresh");
  if (!value) return null;
  const seconds = parse(value);
  return seconds !== null ? seconds * 1000 : null;
}

export async function reload(href = location.href): Promise<void> {
  // Never read the HTTP cache: a page that sets Cache-Control (to make itself
  // prefetchable, say) would otherwise be re-rendered from the same cached copy
  // until it expired, and the refresh would silently show nothing new.
  const res = await fetch(href, { cache: "no-store" });
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, "text/html");
  patch(document.documentElement, doc.documentElement);
}

if (typeof document !== "undefined" && document.currentScript) {
  const ms = findRefresh(document.currentScript as Element);
  if (ms !== null) setInterval(reload, ms);
}

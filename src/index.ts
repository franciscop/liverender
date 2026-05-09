import parse from "./parse";

export function findRate(el: Element): number | null {
  for (const attr of Array.from(el.attributes)) {
    const match = attr.name.match(/^rate-(.+)$/);
    if (match?.[1]) {
      const seconds = parse(match[1]);
      return seconds !== null ? seconds * 1000 : null;
    }
  }
  return null;
}

export async function reload(href = location.href): Promise<void> {
  const res = await fetch(href);
  const text = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
  document.body.innerHTML = doc.body.innerHTML;
}

if (typeof document !== "undefined" && document.currentScript) {
  const ms = findRate(document.currentScript as Element);
  if (ms !== null) setInterval(reload, ms);
}

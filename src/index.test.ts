import { describe, expect, it } from "bun:test";
import parse from "./parse";
import { findRate } from "./index";
import { patch } from "./patch";

describe("parse", () => {
  it("parses seconds", () => {
    expect(parse("5s")).toBe(5);
    expect(parse("1sec")).toBe(1);
    expect(parse("30seconds")).toBe(30);
  });

  it("parses minutes", () => {
    expect(parse("1m")).toBe(60);
    expect(parse("2min")).toBe(120);
    expect(parse("1minute")).toBe(60);
  });

  it("parses hours", () => {
    expect(parse("1h")).toBe(3600);
    expect(parse("2hr")).toBe(7200);
  });

  it("parses days", () => {
    expect(parse("1d")).toBe(86400);
  });

  it("parses milliseconds", () => {
    expect(parse("1000ms")).toBe(1);
    expect(parse("500ms")).toBe(0.5);
  });

  it("handles numeric input", () => {
    expect(parse(5)).toBe(5);
  });

  it("returns null for invalid input", () => {
    expect(parse("invalid")).toBeNull();
    expect(parse(null)).toBeNull();
    expect(parse(undefined)).toBeNull();
  });
});

describe("findRate", () => {
  function makeEl(attrs: string[]): Element {
    return {
      attributes: attrs.map((name) => ({ name, value: "" })),
    } as unknown as Element;
  }

  it("returns ms for rate-5s", () => {
    expect(findRate(makeEl(["rate-5s"]))).toBe(5000);
  });

  it("returns ms for rate-10m", () => {
    expect(findRate(makeEl(["rate-10m"]))).toBe(600_000);
  });

  it("returns ms for rate-1h", () => {
    expect(findRate(makeEl(["rate-1h"]))).toBe(3_600_000);
  });

  it("ignores other attributes and finds rate", () => {
    expect(findRate(makeEl(["src", "async", "rate-30s"]))).toBe(30_000);
  });

  it("returns null when no rate attribute", () => {
    expect(findRate(makeEl(["src", "defer"]))).toBeNull();
  });

  it("returns null for invalid rate value", () => {
    expect(findRate(makeEl(["rate-invalid"]))).toBeNull();
  });
});

describe("patch", () => {
  function wrap(html: string): HTMLDivElement {
    const el = document.createElement("div");
    el.innerHTML = html;
    return el;
  }

  it("updates text content", () => {
    const c = wrap("<p>old</p>");
    patch(c.firstChild!, wrap("<p>new</p>").firstChild!);
    expect(c.firstChild!.textContent).toBe("new");
  });

  it("updates an attribute", () => {
    const c = wrap('<div class="a"></div>');
    patch(c.firstChild!, wrap('<div class="b"></div>').firstChild!);
    expect((c.firstChild as Element).getAttribute("class")).toBe("b");
  });

  it("removes attributes absent in next", () => {
    const c = wrap('<div class="a" id="x"></div>');
    patch(c.firstChild!, wrap('<div class="a"></div>').firstChild!);
    expect((c.firstChild as Element).hasAttribute("id")).toBe(false);
  });

  it("appends new children", () => {
    const c = wrap("<ul><li>a</li></ul>");
    patch(c.firstChild!, wrap("<ul><li>a</li><li>b</li></ul>").firstChild!);
    expect((c.firstChild as Element).children.length).toBe(2);
  });

  it("removes extra children", () => {
    const c = wrap("<ul><li>a</li><li>b</li></ul>");
    patch(c.firstChild!, wrap("<ul><li>a</li></ul>").firstChild!);
    expect((c.firstChild as Element).children.length).toBe(1);
  });

  it("replaces a node when tag name differs", () => {
    const c = wrap("<div>x</div>");
    patch(c.firstChild!, wrap("<span>x</span>").firstChild!);
    expect((c.firstChild as Element).tagName.toLowerCase()).toBe("span");
  });

  it("patches nested content", () => {
    const c = wrap("<div><p>old</p></div>");
    patch(c.firstChild!, wrap("<div><p>new</p></div>").firstChild!);
    expect(c.querySelector("p")!.textContent).toBe("new");
  });
});

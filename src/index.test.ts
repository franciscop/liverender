import { describe, expect, it, beforeEach } from "bun:test";
import parse from "./parse";
import { findRate, reload } from "./index";

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

describe("reload", () => {
  let fetchedUrls: string[] = [];

  beforeEach(() => {
    fetchedUrls = [];
    (globalThis as any).fetch = async (url: string) => {
      fetchedUrls.push(url);
      return { text: async () => "<html><body><p>Updated</p></body></html>" };
    };
    (globalThis as any).DOMParser = class {
      parseFromString(html: string) {
        const match = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html);
        return { body: { innerHTML: match?.[1] ?? "" } };
      }
    };
    (globalThis as any).document = { body: { innerHTML: "old" } };
  });

  it("fetches the given URL", async () => {
    await reload("http://localhost/test");
    expect(fetchedUrls).toEqual(["http://localhost/test"]);
  });

  it("replaces document body", async () => {
    await reload("http://localhost/test");
    expect((globalThis as any).document.body.innerHTML).toBe("<p>Updated</p>");
  });
});

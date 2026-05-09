# liverender [![npm install liverender](https://img.shields.io/badge/npm%20install-liverender-blue.svg)](https://www.npmjs.com/package/liverender) [![test badge](https://github.com/franciscop/liverender/workflows/tests/badge.svg "test badge")](https://github.com/franciscop/liverender/actions) [![gzip size](https://badgen.net/bundlephobia/minzip/liverender?label=gzip&color=green)](https://bundlephobia.com/package/liverender) [![dependencies](https://img.shields.io/badge/dependencies-0-limegreen.svg)](https://github.com/franciscop/liverender/blob/master/package.json)

Reload the page content at a set interval by diffing and patching the live DOM — no full page refresh, only the parts that changed are updated.

```html
<script src="https://cdn.jsdelivr.net/npm/liverender" rate-5s></script>
```

> **This library is designed for very simple, very static websites** — think dashboards, status pages, or server-rendered HTML that updates periodically. It will not work correctly for pages that rely on JavaScript-driven UI, client-side routing, or dynamic `<script>` injection.

## Usage

Add the script tag to your HTML with a `rate-*` attribute specifying how often to reload:

```html
<!-- Reload every 5 seconds -->
<script src="https://cdn.jsdelivr.net/npm/liverender" rate-5s></script>

<!-- Reload every 30 seconds -->
<script src="https://cdn.jsdelivr.net/npm/liverender" rate-30s></script>

<!-- Reload every 2 minutes -->
<script src="https://cdn.jsdelivr.net/npm/liverender" rate-2m></script>
```

## Supported time units

| Unit | Attribute example | Interval |
|------|-------------------|----------|
| Seconds | `rate-10s`, `rate-10sec` | 10 s |
| Minutes | `rate-5m`, `rate-5min` | 5 min |
| Hours | `rate-1h`, `rate-1hr` | 1 h |
| Days | `rate-1d` | 24 h |
| Weeks | `rate-1w`, `rate-1wk` | 7 days |
| Milliseconds | `rate-500ms` | 500 ms |

## How it works

On each interval, liverender fetches the current page URL, parses the response as HTML, and walks both the live document and the fetched document from `<html>` down — diffing and patching only the nodes that actually changed. Text changes, attribute updates, added or removed elements are all handled; unchanged nodes are left alone.

Because nodes are patched in place rather than replaced wholesale, the browser does not re-run `<script>` tags that appear in the fetched HTML. This is intentional for the liverender script itself (you don't want it to restart its own timer), but it also means **any other `<script>` tags in the page will not execute on subsequent fetches**. Similarly, event listeners attached via JavaScript will be lost when the element they're bound to is replaced.

This approach works well when:

- The page is server-rendered HTML that updates over time (dashboards, feeds, status pages)
- Content changes are in markup and text, not driven by client-side JS

It will not work correctly when:

- The page uses a JS framework (React, Vue, etc.)
- New `<script>` tags need to run on each update
- Event listeners or component state matter between refreshes

## Install

```bash
npm install liverender
```

Or load directly from a CDN (no build step needed):

```html
<script src="https://cdn.jsdelivr.net/npm/liverender" rate-5s></script>
```

## License

MIT

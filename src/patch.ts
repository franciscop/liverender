function patchAttrs(current: Element, next: Element): void {
  for (const { name } of Array.from(current.attributes)) {
    if (!next.hasAttribute(name)) current.removeAttribute(name);
  }
  for (const { name, value } of Array.from(next.attributes)) {
    if (current.getAttribute(name) !== value) current.setAttribute(name, value);
  }
}

export function patch(current: Node, next: Node): void {
  if (
    current.nodeType !== next.nodeType ||
    current.nodeName !== next.nodeName
  ) {
    current.parentNode!.replaceChild(next.cloneNode(true), current);
    return;
  }

  if (
    current.nodeType === Node.TEXT_NODE ||
    current.nodeType === Node.COMMENT_NODE
  ) {
    if (current.textContent !== next.textContent)
      current.textContent = next.textContent;
    return;
  }

  patchAttrs(current as Element, next as Element);

  const cc = Array.from(current.childNodes);
  const nc = Array.from(next.childNodes);

  for (let i = 0; i < Math.max(cc.length, nc.length); i++) {
    const c = cc[i];
    const n = nc[i];
    if (c && n) {
      patch(c, n);
    } else if (n) {
      current.appendChild(n.cloneNode(true));
    } else if (c) {
      current.removeChild(c);
    }
  }
}

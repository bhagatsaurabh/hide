import { FNode } from "@/reducers/explorer";
import { ReactNode } from "react";
import { Location } from "react-router";

export const getPath = (node?: FNode) => {
  const path = [];
  while (node) {
    path.push(node.name);
    node = node.parent;
  }
  return path.reverse().join("/");
};

export const u8ToBase64 = (buf: Uint8Array) => {
  let binary = "";
  const len = buf.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buf[i]);
  }
  return btoa(binary);
};

export const base64ToU8 = (b64: string) => {
  const str = atob(b64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
};

export const debounce = <C extends (...args: never[]) => Promise<never> | Promise<void> | never>(
  func: C,
  wait: number
) => {
  let timeout: number;

  return (...args: Parameters<C>): void => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => void func(...args), wait) as unknown as number;
  };
};

export const rng = (min: number, max: number) => {
  const buf = new Uint32Array(1);
  window.crypto.getRandomValues(buf);
  return denormalize(buf[0] / (0xffffffff + 1), min, max);
};
export const denormalize = (norm: number, min: number, max: number) => norm * (max - min) + min;
export const normalize = (val: number, min: number, max: number) => (val - min) / (max - min);
export const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
export const noop = () => {};
export const trapBetween = (root: Node) => {
  if (!root) return { first: null, last: null };

  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      return (node as HTMLElement).tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });

  let currNode = null,
    lastTabbableNode = null;
  const firstTabbableNode = treeWalker.nextNode();
  while ((currNode = treeWalker.nextNode()) !== null) {
    lastTabbableNode = currNode;
  }
  if (!lastTabbableNode) lastTabbableNode = firstTabbableNode;
  return { first: firstTabbableNode as HTMLElement, last: lastTabbableNode as HTMLElement };
};
export const fullUrl = (location: Location) => `${location.pathname ?? ""}${location.hash ?? ""}`;
export const splitUrl = (url: string) => {
  url = url ?? "";
  if (!url.includes("#")) return { path: url, hash: null };
  else {
    const hashIdx = url.indexOf("#");
    return {
      path: url.substring(0, hashIdx),
      hash: url.substring(hashIdx),
    };
  }
};
export const getSlug = (title: string) => `#${title.toLowerCase().replace(" ", "-")}`;
export const checkNetwork = (msg: string) => (!navigator.onLine ? "Network error" : msg);
export const isText = (children: ReactNode): children is string | number =>
  typeof children === "string" || typeof children === "number";

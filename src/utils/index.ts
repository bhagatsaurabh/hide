import { FNode } from "@/reducers/explorer";

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
    console.log(timeout);
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => void func(...args), wait) as unknown as number;
  };
};

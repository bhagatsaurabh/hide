import { ReactNode } from "react";
import { Location } from "react-router";
import iconMapping from "@/assets/icon-map.json";
import { FNode } from "@/models/filesystem";
import { Area } from "react-easy-crop";
import {
  InternalNotificationPayload,
  NotificationType,
  UserNotificationPayload,
  WorkspaceAccessRequest,
} from "@/models/notification";
import {
  errorMap,
  fallbackErrorMap,
  firebaseErrorMap,
  persistentNtfnTypes,
  successMap,
  UserError,
} from "./constants";
import { ServerError } from "./types";
import { isAxiosError } from "axios";
import { FirebaseError } from "firebase/app";

type IconMap = {
  fileNames: Record<string, string>;
  fileExtensions: Record<string, string>;
  languageIds: Record<string, string>;
};
const iconMap = iconMapping as IconMap;

export const getPath = (node?: FNode) => {
  const path = [];
  while (node) {
    path.push(node.name);
    node = node.parent;
  }
  return path.reverse().join("/");
};

export const u8ToBase64 = (buf: Uint8Array) => btoa(String.fromCharCode(...buf));

export const base64ToU8 = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

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
// Leading + Trailing
export const throttle = <C extends (...args: unknown[]) => unknown>(func: C, wait: number) => {
  let lastTime = 0;
  let timeout: number | null = null;
  let lastArgs: Parameters<C> | null = null;

  const invoke = (args: Parameters<C>) => {
    lastTime = Date.now();
    func(...args);
  };

  const later = () => {
    timeout = null;
    if (lastArgs) {
      invoke(lastArgs);
      lastArgs = null;
    }
  };

  const throttled = (...args: Parameters<C>) => {
    const now = Date.now();
    const remaining = wait - (now - lastTime);

    if (lastTime === 0) {
      invoke(args);
    } else if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      invoke(args);
    } else {
      lastArgs = args;
      if (!timeout) {
        timeout = setTimeout(later, remaining) as unknown as number;
      }
    }
  };

  throttled.cancel = () => {
    if (timeout) clearTimeout(timeout);
    timeout = null;
    lastArgs = null;
  };

  return throttled;
};

export const rng = (min: number, max: number) => {
  const buf = new Uint32Array(1);
  window.crypto.getRandomValues(buf);
  return denormalize(buf[0] / (0xffffffff + 1), min, max);
};
export const denormalize = (norm: number, min: number, max: number) => norm * (max - min) + min;
export const normalize = (val: number, min: number, max: number) => (val - min) / (max - min);
export const clamp = (val: number, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) =>
  Math.min(Math.max(val, min), max);
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

export const timeExpression = (date: Date) => {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;

  const ranges = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ];

  for (const { unit, seconds } of ranges) {
    const value = Math.floor(diff / seconds);
    if (value >= 1) return rtf.format(-value, unit as Intl.RelativeTimeFormatUnit);
  }

  return rtf.format(0, "second");
};
export const capitalize = (word: string) => {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

export const parseSizetoPx = (value: string) => {
  const el = document.createElement("div");
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  el.style.width = value;
  document.documentElement.appendChild(el);
  const pixels = el.offsetWidth;
  document.documentElement.removeChild(el);
  return pixels;
};

export const getExt = (name: string) => {
  if (name.lastIndexOf(".") === -1) return "default";
  return name.substring(name.lastIndexOf(".") + 1);
};
export const getFileIcon = (name: string) => {
  const ext = getExt(name);
  return iconMap.fileNames[name] ?? iconMap.fileExtensions[ext] ?? iconMap.languageIds[ext] ?? "document";
};

export const getRandomAccentColor = (opacity = 1) => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 85;
  const lightness = 40;
  return {
    default: `hsl(${hue} ${saturation}% ${lightness}% / 1)`,
    transparent: `hsl(${hue} ${saturation}% ${lightness}% / ${opacity})`,
  };
};

export const convertToPng = async (blob: Blob) => {
  const img = new Image();
  img.src = URL.createObjectURL(blob);
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((pngBlob) => {
      URL.revokeObjectURL(img.src);
      resolve(pngBlob);
    }, "image/png");
  });
};

export const getCroppedImg = async (
  src: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
) => {
  const image = await new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.addEventListener("load", () => res(img));
    img.addEventListener("error", (error) => rej(error));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = src;
  });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const rotRad = (rotation * Math.PI) / 180;
  const { width: bBoxWidth, height: bBoxHeight } = {
    width: Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height),
    height: Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height),
  };

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");
  if (!croppedCtx) {
    return null;
  }

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise<Blob | null>((res, rej) => {
    croppedCanvas.toBlob((blob) => {
      if (!blob) rej();
      res(blob);
    }, "image/png");
  });
};

export const persistentNtfnTypesChecks: Partial<
  Record<NotificationType, (ntfn: UserNotificationPayload) => boolean>
> = {
  "workspace-access-code": (ntfn: UserNotificationPayload) => (ntfn as WorkspaceAccessRequest).success,
};
export const isNotificationPersistent = (ntfn: UserNotificationPayload) => {
  return persistentNtfnTypes.includes(ntfn.type) && (persistentNtfnTypesChecks[ntfn.type]?.(ntfn) ?? true);
};

export const getUserError = (
  error: unknown,
  fallbackCode?: string,
  status = "error"
): { userError: UserError; ntfn: InternalNotificationPayload } => {
  let userError = fallbackCode ? fallbackErrorMap[fallbackCode] : null;

  if (typeof error === "string") {
    userError = errorMap[error] ?? userError;
  } else if (error instanceof FirebaseError) {
    userError = errorMap[firebaseErrorMap[error.code]];
  } else if (isAxiosError<ServerError>(error) && error.response && error.response.data.message !== "UNKNOWN") {
    userError = errorMap[error.response.data.message];
  }
  userError = userError ?? errorMap["UNKNOWN"];

  return {
    userError,
    ntfn: {
      status,
      title: userError.title,
      message: userError.message,
    } as InternalNotificationPayload,
  };
};

export const getUserSuccess = (successCode: string) => {
  const userSuccess = successMap[successCode];
  return {
    userSuccess,
    ntfn: {
      status: "success",
      title: userSuccess.title,
      message: userSuccess.message,
    } as InternalNotificationPayload,
  };
};

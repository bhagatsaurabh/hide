import { NotificationType } from "@/models/notification";
import errors from "@/assets/server-errors.json";
import successes from "@/assets/app-success.json";
import fallbackErrors from "@/assets/app-errors.json";

export const usernameRegex = /^[^!@#$%^&*()+={}[\]`~:;"?/<>\s]{3,}$/;
export const nameRegex = /^.[^!@#$%^&*()+={}[\]`~:;"?/<>]{3,}$/;
export const pinRegex = /^[a-zA-Z0-9]?$/;
export const codeRegex = /^[A-HJ-KM-NP-Z2-9]{16}$/;
export const descRegex = /^.[^!@#$%^&*()+={}[\]`~:;"?/<>]{3,}$/;
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const emailPinRegex = /^[a-zA-Z0-9]{5}$/;

export const KeyCodes = {
  KEYCODE_TAB: 9,
  KEYCODE_ESCAPE: 27,
};

export const imageToIcon: Record<string, string> = {
  "hide-env-empty": "container",
  "hide-env-empty:dev": "container",
  "hide-env-node": "node",
  "hide-env-node:dev": "node",
  "hide-env-python": "python",
  "hide-env-python:dev": "python",
  "hide-env-php": "php",
  "hide-env-php:dev": "php",
  "hide-env-rust": "rust",
  "hide-env-rust:dev": "rust",
  "hide-env-nest": "nest",
  "hide-env-nest:dev": "nest",
  "hide-env-go": "go",
  "hide-env-go:dev": "go",
  "hide-env-deno": "deno",
  "hide-env-deno:dev": "deno",
};

export type UserError = { title: string; message: string; validationErr?: string };
export type UserSuccess = { title: string; message: string };

export const errorMap: Record<string, UserError> = errors;
export const fallbackErrorMap: Record<string, UserError | undefined> = fallbackErrors;
export const firebaseErrorMap: Record<string, string> = {
  "auth/invalid-email": "INVALID_EMAIL",
  "auth/quota-exceeded": "QUOTA_EXCEEDED",
  "auth/user-token-expired": "TOKEN_EXPIRED",
  "auth/too-many-requests": "TOO_MANY_ATTEMPTS_TRY_LATER",
  "auth/unverified-email": "UNVERIFIED_EMAIL",
};
export const successMap: Record<string, UserSuccess> = successes;

export const persistentNtfnTypes: NotificationType[] = ["workspace-invite", "workspace-access-code"];

export const fsIgnoreList = ["lost+found"];

import { NotificationType } from "@/models/notification";

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

export type UserError = { title: string; message: string; validationErr: string };

export const errorMap: Record<string, UserError> = {
  INVALID_EMAIL: {
    title: "Invalid email",
    message: "Provided email is invalid, please check and try again",
    validationErr: "",
  },
  EMAIL_REQUEST_CODE_MAX_ATTEMPTS_REACHED: {
    title: "Max attempts reached",
    message: "Cannot request email verification pin, please try again in 15 minutes.",
    validationErr: "",
  },
  EMAIL_VERIFY_CODE_MAX_ATTEMPTS_REACHED: {
    title: "Max attempts reached",
    message: "Too many wrong attempts, please try again in 15 minutes.",
    validationErr: "",
  },
  PIN_EXPIRED: {
    title: "Invalid pin",
    message: "Provided pin is invalid, please try again.",
    validationErr: "Invalid pin",
  },
  EMAIL_VERIFY_CODE_WRONG: {
    title: "Wrong verification pin",
    message: "Provided pin for email verification is wrong, please try again.",
    validationErr: "Wrong pin",
  },
};

export const persistentNtfnsTypes: NotificationType[] = ["workspace-invite", "workspace-access-code"];

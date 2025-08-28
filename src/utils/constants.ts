export const usernameRegex = /^[^!@#$%^&*()+={}[\]`~:;"?/<>\s]{3,}$/;
export const nameRegex = /^.[^!@#$%^&*()+={}[\]`~:;"?/<>]{3,}$/;
export const descRegex = /^.[^!@#$%^&*()+={}[\]`~:;"?/<>]{3,}$/;

export const KeyCodes = {
  KEYCODE_TAB: 9,
  KEYCODE_ESCAPE: 27,
};

export const imageToIcon: Record<string, string> = {
  "hide-env": "container",
  "hide-env-dev": "container",
  "hide-env-node": "node",
  "hide-env-node-dev": "node",
  "hide-env-python": "python",
  "hide-env-python-dev": "python",
  "hide-env-php": "php",
  "hide-env-php-dev": "php",
  "hide-env-rust": "rust",
  "hide-env-rust-dev": "rust",
  "hide-env-nest": "nest",
  "hide-env-nest-dev": "nest",
  "hide-env-go": "go",
  "hide-env-go-dev": "go",
  "hide-env-deno": "deno",
  "hide-env-deno-dev": "deno",
};

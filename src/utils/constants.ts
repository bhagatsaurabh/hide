export const usernameRegex = /^[^!@#$%^&*()+={}[\]`~:;"?/<>\s]{3,}$/;
export const nameRegex = /^.[^!@#$%^&*()+={}[\]`~:;"?/<>]{3,}$/;

export const KeyCodes = {
  KEYCODE_TAB: 9,
  KEYCODE_ESCAPE: 27,
};

export const imageToIcon: Record<string, string> = {
  "hide-env-node": "node",
  "hide-env-node-dev": "node",
  "hide-env": "container",
  "hide-env-dev": "container"
};

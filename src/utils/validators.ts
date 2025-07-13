import { descRegex, nameRegex } from "./constants";

export const validateName = (val: string) => {
  if (!val) return "Provide a name";
  if (!nameRegex.test(val)) {
    return "Enter a valid name";
  }
  return "";
};

export const validateDesc = (val: string) => {
  if (!val) return "Provide a description";
  if (!descRegex.test(val)) {
    return "Enter a valid description";
  }
  return "";
};

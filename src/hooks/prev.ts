import { useEffect, useRef } from "react";

export function usePrevious<T>(value: T, ignoreEmpty = false): T {
  const ref = useRef<T>(value);

  useEffect(() => {
    if (ignoreEmpty && (typeof value === "undefined" || value === null)) {
      return;
    }
    ref.current = value;
  }, [ignoreEmpty, value]);

  return ref.current;
}

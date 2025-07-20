import { useEffect, useState } from "react";

export function useMediaQuery(q: string) {
  const [match, setMatch] = useState(() => window.matchMedia(q).matches);

  useEffect(() => {
    const query = window.matchMedia(q);
    const update = () => setMatch(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [q]);

  return match;
}

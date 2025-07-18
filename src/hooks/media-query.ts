import { useEffect, useState } from "react";

export function useMediaQuery(q: string) {
  const [match, setMatch] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(q);
    const update = () => setMatch(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [q]);

  return match;
}

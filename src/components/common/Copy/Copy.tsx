import { useEffect, useState } from "react";
import classes from "./Copy.module.css";
import Button from "../Button/Button";

void classes;

interface CopyProps {
  value: () => string | Promise<string>;
}
const Copy = ({ value }: CopyProps) => {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let handle: number;
    if (done) {
      handle = setTimeout(() => {
        setDone(false);
      }, 3000);
    }

    return () => clearTimeout(handle);
  }, [done]);

  const handleCopy = async () => {
    setBusy(true);
    try {
      const val = await value();
      await navigator.clipboard.writeText(val);
      setDone(true);
    } catch (err) {
      void err;
      setDone(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      busy={busy}
      icon={!done ? "copy" : "tick"}
      iconProps={{ asset: true }}
      fit
      className="p-0p25"
      size={0.8}
      onClick={handleCopy}
    />
  );
};

export default Copy;

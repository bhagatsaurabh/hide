import { useEffect, useState } from "react";
import classes from "./Copy.module.css";
import Button from "../Button/Button";
import classNames from "classnames";

void classes;

interface CopyProps {
  className?: string;
  value: () => string | Promise<string>;
}
const Copy = ({ value, className = "" }: CopyProps) => {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let handle: number;
    if (done) {
      handle = window.setTimeout(() => {
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
      fit
      className={classNames([className, "p-0p35"])}
      size={1}
      onClick={handleCopy}
    />
  );
};

export default Copy;

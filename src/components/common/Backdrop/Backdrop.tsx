import { AnimatePresence, motion } from "motion/react";
import classes from "./Backdrop.module.css";
import { ReactNode } from "react";

interface BackdropProps {
  show: boolean;
  clear: boolean;
  layer: number;
  ignoreHeader: boolean;
  children: ReactNode;
  onDismiss: () => void;
}

const Backdrop = ({ show, clear, layer, onDismiss, ignoreHeader = false, children }: Partial<BackdropProps>) => {
  const classNames = [classes.backdrop];
  const layerLevel = layer ?? 0;

  if (clear) classNames.push(classes.clear);
  if (ignoreHeader) classNames.push(classes["ignore-header"]);
  classNames.push(classes[`layer${layerLevel}`]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ ease: "easeIn", duration: 0.15 }}
          className={classNames.join(" ")}
          onPointerUp={onDismiss}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Backdrop;

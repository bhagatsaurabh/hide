import { PropsWithChildren, useCallback, useState } from "react";
import { TooltipContext } from "@/context/tooltip/tooltip.context";
import classes from "./TooltipProvider.module.css";

const TooltipProvider = ({ children }: PropsWithChildren) => {
  const [tooltip, setTooltip] = useState<{
    content: React.ReactNode;
    x: number;
    y: number;
  } | null>(null);
  const showTooltip = useCallback(
    (content: React.ReactNode, x: number, y: number) => setTooltip({ content, x, y }),
    []
  );
  const hideTooltip = useCallback(() => setTooltip(null), []);

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip }}>
      {children}
      {tooltip && (
        <div className={classes.provider} style={{ top: tooltip.y + 10, left: tooltip.x + 10 }}>
          {tooltip.content}
        </div>
      )}
    </TooltipContext.Provider>
  );
};

export default TooltipProvider;

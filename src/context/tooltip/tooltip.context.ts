import { createContext, ReactNode } from "react";

type TooltipContextType = {
  showTooltip: (content: ReactNode, x: number, y: number) => void;
  hideTooltip: () => void;
};

export const TooltipContext = createContext<TooltipContextType | null>(null);

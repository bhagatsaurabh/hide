import { useEffect, useState } from "react";
import classes from "./RadialProgress.module.css";
import { rng } from "@/utils";
import Spinner from "../Spinner/Spinner";

interface RadialProgressProps {
  currStep: number;
  totalSteps: number;
  msg: string;
  radius?: number;
}
export default function RadialProgress({ currStep, totalSteps, msg, radius = 40 }: RadialProgressProps) {
  const [progress, setProgress] = useState((currStep / totalSteps) * 300);

  useEffect(() => {
    const target = ((currStep + 1) / totalSteps) * 300;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < target) {
          return Math.min(prev + rng(3, 5), target);
        }
        return prev;
      });
    }, rng(175, 300));

    return () => clearInterval(interval);
  }, [currStep, totalSteps]);

  useEffect(() => {
    setProgress((prev) => Math.max(prev, (currStep / totalSteps) * 300));
  }, [currStep, totalSteps]);

  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  const offset = currStep >= totalSteps ? 0 : circumference - (progress / 300) * circumference;

  return (
    <div className={classes["radial-container"]}>
      <div className="fs-0 position-relative">
        <svg className={classes["radial-svg"]}>
          <defs>
            <mask id="donutMaskInner">
              <rect width="100%" height="100%" fill="black" />
              <circle cx="64" cy="64" r="47" fill="white" />
            </mask>
            <mask id="donutMaskOuter">
              <rect width="100%" height="100%" fill="white" />
              <circle cx="64" cy="64" r="33" fill="black" />
            </mask>

            <filter id="glowOuter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
            </filter>
            <filter id="glowInner" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
            </filter>
          </defs>
          <g mask="url(#donutMaskInner)" opacity="0.35">
            <circle className={classes["shadow-inner"]} cx="64" cy="64" r="47" />
          </g>
          <g mask="url(#donutMaskOuter)" opacity="0.35">
            <circle className={classes["shadow-outer"]} cx="64" cy="64" r="33" />
          </g>
          <circle
            className={classes["radial-bar"]}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            fill="transparent"
            r={radius}
            cx="64"
            cy="64"
          />
        </svg>
        <div className={classes["radial-steps"]}>
          <span>
            {Math.min(currStep + 1, totalSteps)} / {totalSteps}
          </span>
        </div>
      </div>
      <Spinner className="m-auto" size={1.3} />
      <div className={classes["radial-text"]}>
        <div className={classes["radial-msg"]}>{msg}</div>
      </div>
    </div>
  );
}

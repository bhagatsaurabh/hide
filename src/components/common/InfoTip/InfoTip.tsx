import { ReactNode, useRef, useState } from "react";
import Button from "../Button/Button";
import classes from "./InfoTip.module.css";
import Modal, { ModalRef } from "../Modal/Modal";
import classNames from "classnames";

interface InfoTipProps {
  title: string;
  children?: ReactNode;
  className?: string;
  color?: string;
}
const InfoTip = ({ children, className = "", color, title }: InfoTipProps) => {
  const tipRef = useRef<ModalRef>(null);
  const [show, setShow] = useState(false);

  return (
    <>
      {show && (
        <Modal
          title="info-dedicated"
          onDismiss={() => setShow(false)}
          ref={tipRef}
          className="p-1p5"
          type="pop"
          layer={99}
          plain
        >
          <div className={classes.header}>
            <h2>{title}</h2>
            <Button
              className="p-0p5"
              icon="close"
              iconProps={{ asset: true }}
              size={1}
              fit
              onClick={() => tipRef.current?.close()}
            />
          </div>
          {children}
        </Modal>
      )}
      <Button
        iconProps={{ color, asset: true }}
        className={classNames(["p-0", "fs-0", "d-inline", className])}
        icon="info-question"
        onClick={() => setShow(!show)}
        fit
      />
    </>
  );
};

export default InfoTip;

import Icon from "@/components/common/Icon/Icon";
import classes from "./TerminalGroup.module.css";
import { MouseEvent, useContext, useEffect, useState } from "react";
import { TooltipContext } from "@/context/tooltip/tooltip.context";
import classNames from "classnames";
import Terminal from "@/components/Terminal/Terminal";
import { socket } from "@/config/socket";
import { ViewContext } from "@/context/view/view.context";
import { uuidv4 as uuid } from "lib0/random.js";

const TerminalGroup = () => {
  const { hideTooltip, showTooltip } = useContext(TooltipContext)!;
  const [terms, setTerms] = useState<string[]>([]);
  const [activeId, setActiveId] = useState("");
  const { workspace } = useContext(ViewContext)!;

  const handleNewTerminal = () => {
    setTerms((prev) => [...prev, uuid()]);
  };
  const handleRemoveTerminal = (id: string) => {
    setTerms((prev) => {
      const updated = new Set(prev);
      updated.delete(id);
      return [...updated];
    });
  };

  useEffect(
    () => () => {
      socket?.emit("msg", {
        service: "env",
        action: "ssh.close",
        payload: {
          uuid: workspace.uuid,
          sessionId: "#all",
        },
      });
    },
    [workspace.uuid]
  );

  return (
    <div className={classes.termgroup}>
      <div className={classes.heading}>
        <div className={classes.section}>
          <span className={classes.title}>TERMINAL</span>
        </div>
        <div className={[classes.section, classes.actions].join(" ")}>
          <button
            onClick={handleNewTerminal}
            onMouseEnter={(e: MouseEvent) => showTooltip("New Terminal", e.clientX, e.clientY)}
            onMouseLeave={hideTooltip}
            className="p-0p1"
          >
            <Icon name="plus" />
          </button>
        </div>
      </div>
      <div className={classes.content}>
        <div className={classes.terminal}>
          {terms.map((termId) => (
            <Terminal show={termId === activeId} key={termId} id={termId} onClose={handleRemoveTerminal} />
          ))}
        </div>
        <ul className={classes.list}>
          {terms.map((termId) => (
            <li
              onClick={() => setActiveId(termId)}
              className={classNames({ [classes.active]: activeId === termId })}
              key={termId}
            >
              <div className={classes.itemsect}>
                <Icon name="terminal" className="mr-0p25" />
                <span>shell</span>
              </div>
              <div className={[classes.itemsect, classes.actions].join(" ")}>
                <button
                  onClick={() => handleRemoveTerminal(termId)}
                  onMouseEnter={(e: MouseEvent) => showTooltip("Delete", e.clientX, e.clientY)}
                  onMouseLeave={hideTooltip}
                  className="p-0p1"
                >
                  <Icon name="bin" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TerminalGroup;

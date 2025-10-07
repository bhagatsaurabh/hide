import { MenuItem } from "@/models/context-menu";
import classes from "./ActivityBar.module.css";
import Icon from "@/components/common/Icon/Icon";
import bus from "@/config/bus";

const ActivityBar = () => {
  const menuItems: MenuItem[] = [
    {
      type: "submenu",
      label: "File",
      items: [
        { type: "action", label: "New File...", command: "file.new" },
        { type: "separator" },
        { type: "action", label: "New Folder...", command: "folder.new" },
      ],
    },
    {
      type: "submenu",
      label: "Edit",
      items: [
        { type: "action", label: "Undo", command: "edit.undo" },
        { type: "action", label: "Redo", command: "edit.redo" },
        { type: "separator" },
        { type: "action", label: "Find", command: "edit.find" },
        { type: "action", label: "Replace", command: "edit.replace" },
      ],
    },
    {
      type: "submenu",
      label: "Terminal",
      items: [{ type: "action", label: "New Terminal", command: "terminal.new" }],
    },
    {
      type: "submenu",
      label: "Help",
      items: [
        { type: "action", label: "Report Issue", command: "help.report" },
        { type: "separator" },
        { type: "action", label: "About", command: "help.about" },
      ],
    },
  ];

  return (
    <div className={classes.activitybar} onContextMenu={(e) => e.preventDefault()}>
      <div className={classes.upper}>
        <button
          onClick={(e) => {
            e.preventDefault();
            bus.emit("internal.context.open", {
              anchor: e.target as HTMLElement,
              items: menuItems,
            });
          }}
        >
          <Icon name="burger" size={1.75} asset />
        </button>
        <button>
          <Icon name="files" size={1.7} asset />
        </button>
      </div>
      <div className={classes.lower}></div>
    </div>
  );
};

export default ActivityBar;

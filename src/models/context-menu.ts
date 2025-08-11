export interface CommandMap {
  "internal.context.open": (ctx: { anchor: HTMLElement; items: MenuItem[] }) => void;
  "internal.context.close": () => void;
  "file.new": (ctx: {}) => void;
  "folder.new": (ctx: {}) => void;
  "edit.undo": (ctx: {}) => void;
  "edit.redo": (ctx: {}) => void;
  "edit.find": (ctx: {}) => void;
  "edit.replace": (ctx: {}) => void;
  "terminal.new": (ctx: {}) => void;
  "help.report": (ctx: {}) => void;
  "help.about": (ctx: {}) => void;
}

export type Separator = {};
export type SubMenu = {
  label: string;
  items: MenuItem[];
  icon?: string;
  disabled?: boolean;
};
export type Action = {
  label: string;
  command: keyof CommandMap;
  icon?: string;
  disabled?: boolean;
};
export type MenuItemMap = {
  separator: Separator;
  action: Action;
  submenu: SubMenu;
};
export type MenuItem = {
  [K in keyof MenuItemMap]: { type: K } & MenuItemMap[K];
}[keyof MenuItemMap];

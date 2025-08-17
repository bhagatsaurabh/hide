export interface CommandMap {
  "internal.context.open": (ctx: { anchor: HTMLElement; items: MenuItem[] }) => void;
  "internal.context.close": () => void;
  "internal.explorer.refresh": () => void;
  "internal.explorer.collapseall": () => void;
  "internal.explorer.collapse": (ctx: { path: string }) => void;
  "file.new": (ctx: { path: string }) => void;
  "folder.new": (ctx: { path: string }) => void;
  "edit.undo": (ctx: undefined) => void;
  "edit.redo": (ctx: undefined) => void;
  "edit.find": (ctx: undefined) => void;
  "edit.replace": (ctx: undefined) => void;
  "terminal.new": (ctx: undefined) => void;
  "help.report": (ctx: undefined) => void;
  "help.about": (ctx: undefined) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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

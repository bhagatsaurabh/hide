export interface CommandMap {
  "internal.context.open": (ctx: { anchor: HTMLElement; items: MenuItem[] }) => void;
  "internal.context.close": () => void;
  "internal.explorer.refresh": () => void;
  "internal.explorer.collapseall": () => void;
  "internal.explorer.collapse": (ctx: { path: string }) => void;
  "internal.editor.disconnected": (ctx: { ino: number }) => void;
  "internal.file.displaced": (ctx: { ino: number }) => void;
  "file.new": (ctx: { path: string }) => void;
  "folder.new": (ctx: { path: string }) => void;
  "edit.undo": () => void;
  "edit.redo": () => void;
  "edit.find": () => void;
  "edit.replace": () => void;
  "terminal.new": () => void;
  "help.report": () => void;
  "help.about": () => void;
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

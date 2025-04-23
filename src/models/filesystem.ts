export interface FSOpenDTO {
  name: string;
  path: string;
  type: "file" | "dir";
}

export interface FileTreeNode extends FSOpenDTO {
  children: FileTreeNode[];
}

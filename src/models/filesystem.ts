export interface FSOpenDTO {
  name: string;
  path: string;
  type: "file" | "dir";
}

export interface FSSyncDTO {
  uid: string;
  path: string;
  action: "add" | "addDir" | "unlink" | "unlinkDir" | "change";
}

export interface FileTreeNode extends FSOpenDTO {
  children: FileTreeNode[];
}

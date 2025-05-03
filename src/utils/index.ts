import { FileNode } from "@/reducers/explorer";

export const getPath = (node?: FileNode) => {
  const path = [];
  while (node) {
    path.push(node.name);
    node = node.parent;
  }
  return path.reverse().join("/");
};

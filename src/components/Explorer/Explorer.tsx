import { FileTreeNode } from "@/models/filesystem";
import { FileNode } from "../FileNode/FileNode";

interface ExplorerProps {
  root: FileTreeNode;
}

export const Explorer = ({ root }: ExplorerProps) => {
  return (
    <div>
      {root.children.map((node, index) => (
        <FileNode key={index} node={node} />
      ))}
    </div>
  );
};

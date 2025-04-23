import { FileTreeNode } from "@/models/filesystem";
import { useState } from "react";

interface FileNodeProps {
  node: FileTreeNode;
}

export const FileNode = ({ node }: FileNodeProps) => {
  const [expanded, setExpanded] = useState(false);
  const isDir = node.type === "dir";

  return (
    <div style={{ marginLeft: 20 }}>
      <div onClick={() => isDir && setExpanded(!expanded)} style={{ cursor: isDir ? "pointer" : "default" }}>
        {isDir ? (expanded ? "📂" : "📁") : "📄"} {node.name}
      </div>

      {isDir && expanded && (
        <div>
          {node.children?.map((child, index) => (
            <FileNode key={index} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

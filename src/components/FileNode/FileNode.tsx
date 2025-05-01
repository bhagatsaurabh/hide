import { useContext } from "react";
import { EnvContext } from "@/pages/Environment/context";
import { FileNode as FNode } from "@/reducers/explorer";

interface FileNodeProps {
  node: FNode;
}

export const FileNode = ({ node }: FileNodeProps) => {
  const isDir = node.type === "dir";
  const envCtx = useContext(EnvContext)!;

  const handleClick = () => {
    if (isDir) {
      node.isOpen = !node.isOpen;
      if (node.isOpen) envCtx.open(node.path);
      else envCtx.close(node.path);
    }
  };

  return (
    <div style={{ marginLeft: 20 }}>
      <div onClick={handleClick} style={{ cursor: isDir ? "pointer" : "default" }}>
        {isDir ? (node.isOpen ? "📂" : "📁") : "📄"} {node.name}
      </div>

      {isDir && node.isOpen && (
        <div>
          {node.children?.map((child, index) => (
            <FileNode key={index} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

import { useContext } from "react";
import { EnvContext } from "@/context/env/env.context";
import { FNode } from "@/reducers/explorer";
import { getPath } from "@/utils";

interface FileNodeProps {
  node: FNode;
}

export const FileNode = ({ node }: FileNodeProps) => {
  const isDir = node.type === "dir";
  const envCtx = useContext(EnvContext)!;

  const handleClick = () => {
    const path = getPath(node);
    if (isDir) {
      node.isOpen = !node.isOpen;
      envCtx[node.isOpen ? "open" : "close"](path, isDir);
    } else {
      if (!node.isOpen) {
        envCtx.open(path, isDir);
      }
    }
  };

  return (
    <div style={{ marginLeft: 20 }}>
      <div onClick={handleClick} style={{ cursor: isDir ? "pointer" : "default" }}>
        {isDir ? (node.isOpen ? "📂" : "📁") : "📄"} {node.name}{" "}
        {node.type === "file" && (
          <>
            {node.isOpen && <button onClick={() => envCtx.close(getPath(node), isDir)}>Close</button>}
            <button onClick={() => envCtx.save(getPath(node))}>Save</button>
          </>
        )}
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

import { getPath } from "@/utils";

interface FTActionMap {
  LOAD: { path: string; nodes: FileNode[] };
  UNLOAD: { path: string };
  CREATE: { id: number; parentId: number };
  WRITE: { id: number };
  RENAME: { id: number };
  REMOVE: { id: number };
}
type FTAction = {
  [K in keyof FTActionMap]: {
    type: K;
    payload: FTActionMap[K];
  };
}[keyof FTActionMap];

type FileNodeMap = {
  file: undefined;
  dir: FileNode[];
};
export type FileNode = {
  [K in keyof FileNodeMap]: {
    name: string;
    type: K;
    id: number;
    parent?: FileNode;
    isOpen?: boolean;
    children: FileNodeMap[K];
  };
}[keyof FileNodeMap];

export type ExplorerState = {
  root: FileNode;
  pathMap: Map<string, FileNode>;
};

export function fileTreeReducer(state: ExplorerState, action: FTAction): ExplorerState {
  switch (action.type) {
    case "LOAD": {
      const dirNode = state.pathMap.get(action.payload.path);
      if (!dirNode) return state;

      dirNode.children = action.payload.nodes;
      action.payload.nodes.forEach((node) => {
        if (node.type === "dir") node.children = [];
        node.parent = dirNode;
        state.pathMap.set(`${getPath(dirNode)}/${node.name}`, node);
      });
      return { ...state };
    }
    case "UNLOAD": {
      const dirNode = state.pathMap.get(action.payload.path);
      if (!dirNode) return state;

      const path = getPath(dirNode);
      dirNode.children?.forEach((child) => {
        state.pathMap.delete(`${path}/${child.name}`);
      });
      dirNode.children = [];
      return { ...state };
    }
    case "CREATE":
      return state;
    case "WRITE":
      return state;
    case "RENAME":
      return state;
    case "REMOVE":
      return state;
    default:
      return state;
  }
}

const update = (
  nodes: FileNode[],
  match: (node: FileNode) => boolean,
  transform: (node: FileNode) => FileNode | null
): FileNode[] => {
  /* return nodes.map((node) => {
    if (node.id === action.payload.id) {
      switch (action.type) {
        case "CREATE":
          return { ...node, name: action.payload.parentId };
        case "TOGGLE_FOLDER":
          return { ...node, isOpen: !node.isOpen };
        case "DELETE_NODE":
          return null;
      }
    }

    if (node.type === "folder" && node.children) {
      return {
        ...node,
        children: update(node.children).filter(Boolean),
      };
    }

    return node;
  }); */
  return [];
};

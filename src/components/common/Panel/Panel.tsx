import { ViewSlot } from "../ViewSlot/ViewSlot";

export type PanelSchema = {
  type: "panel" | "view";
  direction?: "row" | "column";
  children?: PanelSchema[];
  viewId?: string;
  resizable?: boolean;
  collapsible?: boolean;
};

interface PanelProps {
  schema: PanelSchema;
}

export const Panel = ({ schema }: PanelProps) => {
  if ("type" in schema && schema.type === "view") {
    return (
      <div style={{ flex: 1, border: "1px solid gray", padding: 5 }}>
        <ViewSlot viewId={schema.viewId!} />
      </div>
    );
  }

  const isRow = schema.direction ?? "row";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: isRow ? "row" : "column",
        flex: 1,
        gap: 4,
      }}
    >
      {schema.children?.map((child, index) => (
        <Panel key={index} schema={child} />
      ))}
    </div>
  );
};

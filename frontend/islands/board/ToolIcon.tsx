import { useContext } from "../../../deps_client.ts";
import IconCircle from "../app/IconCircle.tsx";
import { Mode, SettingsContext } from "../../../client/settings.ts";
import { Tool } from "../../../client/settings.ts";

export const toolIcons: Record<Tool, string> = {
  [Tool.PEN]: "curve",
  [Tool.LINE]: "line",
  [Tool.RECTANGLE]: "rectangle",
  [Tool.POLYLINE]: "polyline",
  [Tool.POLYGON]: "polygon",
  [Tool.ELLIPSE]: "radio-button-off-outline",
};

export default function ToolIcon({ chosenTool }: { chosenTool: Tool }) {
  const settings = useContext(SettingsContext);

  const tool = settings.tool;

  const selectTool = () => {
    settings.mode.value = Mode.DRAW;
    tool.value = chosenTool;
  };

  return <IconCircle iconName={toolIcons[chosenTool]} onClick={selectTool} />;
}

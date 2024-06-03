import { useContext } from "../../../deps_client.ts";
import IconCircle from "../app/IconCircle.tsx";
import { SettingsContext } from "../../../client/settings.ts";
import { Tool } from "../../../client/settings.ts";

export const toolIcons: Record<Tool, string> = {
  [Tool.PEN]: "curve",
  [Tool.LINE]: "line",
  [Tool.RECTANGLE]: "rectangle",
  [Tool.POLYLINE]: "polyline",
  [Tool.POLYGON]: "polygon",
  [Tool.ELLIPSE]: "radio-button-off-outline",
  [Tool.ERASER]: "eraser",
  [Tool.MOVE]: "hand-right-outline",
};

export default function ToolIcon({chosenTool,}:{chosenTool: Tool;}) {
  const settings = useContext(SettingsContext);

  const tool = settings.tool;
  const size = settings.size;
  const penSize = settings.penSize;
  const eraserSize = settings.eraserSize;

  const selectTool = () => {
    if(chosenTool == Tool.ERASER)
        size.value=eraserSize.value;
    else 
        size.value=penSize.value;
    tool.value = chosenTool;
  };

  return <IconCircle iconName={toolIcons[chosenTool]} onClick={selectTool} />;
}

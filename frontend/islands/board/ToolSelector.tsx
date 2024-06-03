import { useContext } from "../../../deps_client.ts";
import IconCircle from "../app/IconCircle.tsx";
import { SettingsContext } from "../../../client/settings.ts";
import { Tool } from "../../../client/settings.ts";

const toolIcons: Record<Tool, string> = {
  [Tool.PEN]: "pencil-outline",
  [Tool.ERASER]: "eraser",
  [Tool.MOVE]: "hand-right-outline",
  [Tool.SELECT]: "crop-outline",
};

export default function ToolSelector() {
  const settings = useContext(SettingsContext);

  const tool = settings.tool;
  const size = settings.size;
  const penSize = settings.penSize;
  const eraserSize = settings.eraserSize;

  const nextTool = () => {
    switch (tool.peek()) {
      case Tool.PEN:
        tool.value = Tool.ERASER;
        size.value = eraserSize.peek();
        break;
      case Tool.ERASER:
        tool.value = Tool.MOVE;
        break;
      case Tool.MOVE:
        tool.value = Tool.PEN;
        size.value = penSize.peek();
        break;
      case Tool.SELECT:
        tool.value = Tool.PEN;
        size.value = penSize.peek();
        break;
    }
  };
  return <IconCircle iconName={toolIcons[tool.value]} onClick={nextTool} />;
}

import { useContext } from "../../../deps_client.ts";
import IconCircle from "../../components/IconCircle.tsx";
import { SettingsContext } from "../../../client/settings.ts";
import { Tool } from "../../../client/settings.ts";

const toolIcons: Record<Tool, string> = {
  [Tool.PEN]: "pencil-outline",
  [Tool.ERASER]: "ban-outline",
};

export default function ToolSelector() {
  const tool = useContext(SettingsContext).tool;
  const nextTool = () => {
    switch (tool.peek()) {
      case Tool.PEN:
        tool.value = Tool.ERASER;
        break;
      case Tool.ERASER:
        tool.value = Tool.PEN;
        break;
    }
  };
  return <IconCircle iconName={toolIcons[tool.value]} onClick={nextTool} />;
}

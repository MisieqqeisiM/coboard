import { SettingsContext, Tool } from "../../../client/settings.ts";
import {
  ComponentChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "../../../deps_client.ts";
import IconCircle from "../app/IconCircle.tsx";
import { HideContext } from "./Controls.tsx";
import ToolIcon, { toolIcons } from "./ToolIcon.tsx";

export default function ToolMenu() {
  const slide = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState<string | undefined>();
  const hide = useContext(HideContext);
  const settings = useContext(SettingsContext);
  const tool = settings.tool;

  const toggle = () => {
    slide.current?.classList.toggle("active");
    if (slide.current?.classList.contains("active")) {
      setColor("#33c3f0");
    } else {
      setColor(undefined);
    }
  };

  useEffect(() => {
    hide.subscribe((_) => slide.current?.classList.remove("active"));
    tool.subscribe((_) => slide.current?.classList.remove("active"));
  }, []);

  const tools = [
    Tool.POLYGON,
    Tool.POLYLINE,
    Tool.ELLIPSE,
    Tool.RECTANGLE,
    Tool.LINE,
    Tool.PEN,
  ];
  const unchosen = tools.filter((item) => item != tool.peek());

  return (
    <div style={{ position: "relative" }}>
      <div class="slide-out" ref={slide}>
        <ToolIcon
          chosenTool={unchosen[0]}
        />
        <ToolIcon
          chosenTool={unchosen[1]}
        />
        <ToolIcon
          chosenTool={unchosen[2]}
        />
        <ToolIcon
          chosenTool={unchosen[3]}
        />
        <ToolIcon
          chosenTool={unchosen[4]}
        />

        <div class="cover" style={{ zIndex: 1001 }}>
          <IconCircle
            iconName={toolIcons[tool.value]}
            onClick={toggle}
            color={color}
          />
        </div>
      </div>
    </div>
  );
}

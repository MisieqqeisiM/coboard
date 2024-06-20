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

export default function OptionsMenu(
  { children }: { children: ComponentChildren },
) {
  const slide = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState<string | undefined>();
  const hide = useContext(HideContext);

  const toggle = () => {
    slide.current?.classList.toggle("active");
    if (slide.current?.classList.contains("active")) {
      setColor("#33c3f0");
    } else {
      setColor(undefined);
    }
  };

  useEffect(() => {
    hide.subscribe((_) => {
      slide.current?.classList.remove("active");
    });
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div class="slide-out" ref={slide}>
        {children}
        <div class="cover" style={{ zIndex: 1001 }}>
          <IconCircle
            iconName="ellipsis-vertical-outline"
            onClick={toggle}
            color={color}
          />
        </div>
      </div>
    </div>
  );
}

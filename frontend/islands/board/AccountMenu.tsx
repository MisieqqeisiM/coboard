import { ComponentChildren, useRef, useState } from "../../../deps_client.ts";
import IconCircle from "../../components/IconCircle.tsx";

export default function AccountMenu(
  { children }: { children: ComponentChildren },
) {
  const slide = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState<string | undefined>();
  const toggle = () => {
    slide.current?.classList.toggle("active");
    if (slide.current?.classList.contains("active")) {
      setColor("#33c3f0");
    } else {
      setColor(undefined);
    }
  };
  return (
    <div style={{ position: "relative" }}>
      <div class="slide-out" ref={slide}>
        {children}
        <div class="cover" style={{ zIndex: 1001 }}>
          <IconCircle
            iconName="person-outline"
            onClick={toggle}
            color={color}
          />
        </div>
      </div>
    </div>
  );
}

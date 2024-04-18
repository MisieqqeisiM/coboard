import { useRef, useState } from "preact/hooks";
import IconCircle from "../../components/IconCircle.tsx";
import { ComponentChildren } from "https://esm.sh/v128/preact@10.19.2/src/index.js";

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
        <div style={{ zIndex: 1001 }}>
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

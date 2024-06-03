import { useContext, useEffect, useRef } from "../../../deps_client.ts";
import { Color } from "../../../client/settings.ts";
import { SettingsContext } from "../../../client/settings.ts";
import { ThemeContext } from "../app/Themed.tsx";
import { HideContext } from "./Controls.tsx";

function ColorBar({
  visibleColor,
  color,
  selectColor,
  rotation,
  selectColorTmp,
}: {
  visibleColor: string;
  color: Color;
  selectColor: (color: Color) => void;
  selectColorTmp: (color: Color) => void;
  rotation: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <div
      ref={ref}
      class="color"
      style={{
        backgroundColor: visibleColor,
        transform: `rotate(${rotation}deg)`,
      }}
      onClick={() => selectColor(color)}
      onPointerUp={() => selectColor(color)}
      onPointerEnter={(e) => {
        if (e.buttons & 1) {
          selectColorTmp(color);
        }
        ref.current?.classList.add("highlighted");
      }}
      onPointerLeave={() => ref.current?.classList.remove("highlighted")}
    >
    </div>
  );
}

export default function ColorSelector() {
  const selector = useRef<HTMLDivElement | null>(null);
  const color = useContext(SettingsContext).color;
  const theme = useContext(ThemeContext);

  const selectColor = (c: Color) => {
    color.value = c;
    selector.current?.classList.remove("active");
  };

  const spread = 120;
  const start = -spread / 2;
  const d = spread / (Object.keys(Color).length - 1);
  let downTime = 0;
  let nextFlip = false;

  const down = (e: PointerEvent) => {
    // deno-lint-ignore no-explicit-any
    (e.target as any).releasePointerCapture(e.pointerId);
    downTime = Date.now();
    nextFlip = selector.current?.classList.contains("active") ?? false;
    selector.current?.classList.add("active");
  };

  useEffect(() => {
    globalThis.addEventListener("keypress", (e) => {
      switch (e.key) {
        case "1":
          color.value = Color.BLACK;
          break;
        case "2":
          color.value = Color.DARK_BLUE;
          break;
        case "3":
          color.value = Color.BLUE;
          break;
        case "4":
          color.value = Color.CYAN;
          break;
        case "5":
          color.value = Color.GREEN;
          break;
        case "6":
          color.value = Color.YELLOW;
          break;
        case "7":
          color.value = Color.ORANGE;
          break;
        case "8":
          color.value = Color.RED;
          break;
        case "9":
          color.value = Color.MAGENTA;
          break;
        case "0":
          color.value = Color.VIOLET;
          break;
      }
    });
  }, []);

  const up = () => {
    if (Date.now() > downTime + 300) {
      selector.current?.classList.remove("active");
    } else if (nextFlip) {
      selector.current?.classList.remove("active");
    }
  };

  const hide = useContext(HideContext);

  useEffect(() => {
    hide.subscribe((_) => {
      selector.current?.classList.remove("active");
    });
  }, []);

  return (
    <div class="color-selector" ref={selector}>
      <div class="color-box">
        {Array.from(Object.values(Color).entries()).map(([i, c]) => (
          <ColorBar
            visibleColor={c == Color.BLACK && !theme.value ? "#dddddd" : c}
            color={c}
            selectColor={selectColor}
            rotation={start + i * d}
            selectColorTmp={(c) => color.value = c}
          />
        ))}
      </div>
      <div
        class="color-indicator"
        onPointerDown={down}
        onPointerUp={up}
      >
        <div
          class="color-circle"
          style={{
            backgroundColor: color.value == Color.BLACK && !theme.value
              ? "#dddddd"
              : color.value,
          }}
        >
        </div>
      </div>
    </div>
  );
}

import { StateUpdater, useRef, useState } from "preact/hooks";

function Color({
  color,
  selectColor,
  rotation,
  selectColorTmp,
}: {
  color: string;
  selectColor: (color: string) => void;
  selectColorTmp: (color: string) => void;
  rotation: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <div
      ref={ref}
      class="color"
      style={{ backgroundColor: color, transform: `rotate(${rotation}deg)` }}
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
  const colors = [
    "#13161b",
    "#1e20a6",
    "#0f93ff",
    "#00ffd5",
    "#56eb20",
    "#ffeb0a",
    "#ff7518",
    "#db1d00",
    "#ff007b",
    "#cf60ff",
  ];

  const selector = useRef<HTMLDivElement | null>(null);

  const [color, setColor] = useState(colors[0]);

  const selectColor = (color: string) => {
    setColor(color);
    selector.current?.classList.remove("active");
  };

  const spread = 120;
  const start = -spread / 2;
  const d = spread / (colors.length - 1);
  let downTime = 0;
  let nextFlip = false;

  const down = (e: PointerEvent) => {
    // deno-lint-ignore no-explicit-any
    (e.target as any).releasePointerCapture(e.pointerId);
    downTime = Date.now();
    nextFlip = selector.current?.classList.contains("active") ?? false;
    selector.current?.classList.add("active");
  };

  const up = () => {
    if (Date.now() > downTime + 300) {
      selector.current?.classList.remove("active");
    } else if (nextFlip) {
      selector.current?.classList.remove("active");
    }
  };
  return (
    <div class="color-selector" ref={selector}>
      <div class="color-box">
        {Array.from(colors.entries()).map(([i, color]) => (
          <Color
            color={color}
            selectColor={selectColor}
            rotation={start + i * d}
            selectColorTmp={setColor}
          />
        ))}
      </div>
      <div
        class="color-indicator"
        onPointerDown={down}
        onPointerUp={up}
      >
        <div class="color-circle" style={{ backgroundColor: color }}></div>
      </div>
    </div>
  );
}

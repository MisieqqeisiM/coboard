import { StateUpdater, useState } from "preact/hooks";

function Color({
  color,
  setColor,
}: {
  color: string;
  setColor: StateUpdater<string>;
}) {
  return (
    <div
      class="color"
      style={{ backgroundColor: color }}
      onClick={() => setColor(color)}
      onTouchEnd={() => setColor(color)}
    ></div>
  );
}

export default function ColorSelector() {
  const colors = [
    "red",
    "green",
    "blue",
    "yellow",
    "magenta",
    "cyan",
    "white",
    "black",
  ];

  const [color, setColor] = useState(colors[0]);
  return (
    <div class="color-selector">
      <div class="color-box">
        {colors.map((color) => (
          <Color color={color} setColor={setColor} />
        ))}
      </div>
      <div class="color-indicator">
        <div class="color-circle" style={{ backgroundColor: color }}></div>
      </div>
    </div>
  );
}

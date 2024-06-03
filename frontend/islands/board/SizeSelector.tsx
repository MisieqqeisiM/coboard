import { useContext, useRef } from "../../../deps_client.ts";
import { Mode, SettingsContext, Tool } from "../../../client/settings.ts";

export default function SizeSelector() {
  const settings = useContext(SettingsContext);
  const slider = useRef<HTMLInputElement>(null);
  const sliderBox = useRef<HTMLDivElement>(null);
  return (
    <div class="size-selector">
      <div
        class="icon-circle"
        onClick={() => {
          sliderBox.current?.classList.toggle("active");
        }}
      >
        <div
          class="size-indicator"
          style={{
            width: settings.size.value,
            height: settings.size.value,
          }}
        >
        </div>
      </div>
      <div
        ref={sliderBox}
        class="slider-box"
        onPointerUp={() => {
          sliderBox.current?.classList.toggle("active");
        }}
      >
        <input
          type="range"
          min="3"
          max="40"
          value={settings.size.value}
          ref={slider}
          onInput={() => {
            const value = Number(slider.current?.value);
            switch (settings.tool.peek()) {
              case Mode.DRAW:
                settings.penSize.value = value;
                break;
              case Mode.ERASE:
                settings.eraserSize.value = value;
                break;
            }
            settings.size.value = value;
          }}
        />
      </div>
    </div>
  );
}

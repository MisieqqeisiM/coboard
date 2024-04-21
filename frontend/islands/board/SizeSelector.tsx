import { useContext, useRef } from "preact/hooks";
import { SettingsContext } from "../../../client/settings.ts";

export default function SizeSelector() {
  const size = useContext(SettingsContext).size;
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
          style={{
            border: "2px dashed #222222",
            width: size.value,
            height: size.value,
            borderRadius: "50%",
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
          min="10"
          max="40"
          ref={slider}
          onInput={() => {
            size.value = Number(slider.current?.value);
          }}
        />
      </div>
    </div>
  );
}

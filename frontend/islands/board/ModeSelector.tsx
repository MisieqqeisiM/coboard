import { useContext, useEffect } from "../../../deps_client.ts";
import IconCircle from "../app/IconCircle.tsx";
import { Mode, SettingsContext } from "../../../client/settings.ts";

const modeIcons: Record<Mode, string> = {
  [Mode.DRAW]: "pencil-outline",
  [Mode.ERASE]: "eraser",
  [Mode.MOVE]: "hand-right-outline",
  [Mode.SELECT]: "crop-outline",
};

export default function ModeSelector() {
  const settings = useContext(SettingsContext);

  const mode = settings.mode;
  const size = settings.size;
  const penSize = settings.penSize;
  const eraserSize = settings.eraserSize;

  const nextTool = () => {
    switch (mode.peek()) {
      case Mode.DRAW:
        size.value = eraserSize.value;
        mode.value = Mode.ERASE;
        break;
      case Mode.ERASE:
        size.value = penSize.value;
        mode.value = Mode.MOVE;
        break;
      case Mode.MOVE:
        size.value = penSize.value;
        mode.value = Mode.DRAW;
        break;
      case Mode.SELECT:
        size.value = penSize.value;
        mode.value = Mode.DRAW;
        break;
    }
  };

  useEffect(() => {
    globalThis.addEventListener("keypress", (e) => {
      switch (e.key) {
        case "q":
          size.value = penSize.value;
          mode.value = Mode.DRAW;
          break;
        case "w":
          size.value = eraserSize.value;
          mode.value = Mode.ERASE;
          break;
        case "e":
          mode.value = Mode.MOVE;
          break;
      }
    });
  }, []);
  return <IconCircle iconName={modeIcons[mode.value]} onClick={nextTool} />;
}

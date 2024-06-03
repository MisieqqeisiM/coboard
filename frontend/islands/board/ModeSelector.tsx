import { useContext } from "../../../deps_client.ts";
import IconCircle from "../app/IconCircle.tsx";
import { Mode, SettingsContext } from "../../../client/settings.ts";
import { Tool } from "../../../client/settings.ts";

const modeIcons: Record<Mode, string> = {
  [Mode.DRAW]: "pencil-outline",
  [Mode.ERASE]: "eraser",
  [Mode.MOVE]: "hand-right-outline",
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
    }
  };
  return <IconCircle iconName={modeIcons[mode.value]} onClick={nextTool} />;
}

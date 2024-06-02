import {
  ComponentChildren,
  Signal,
  useContext,
  useEffect,
  useRef,
} from "../../../deps_client.ts";
import { Camera } from "../../../client/camera.ts";
import { CameraContext } from "../../../client/camera.ts";
import { SettingsContext, Tool } from "../../../client/settings.ts";
import { ClientContext } from "../app/WithClient.tsx";
import { Behavior, BehaviorContext } from "./behaviors/Behavior.ts";
import { DrawableCanvas } from "../../../client/canvas.ts";
import { EraseBehavior } from "./behaviors/EraseBehavior.ts";
import { MoveBehavior } from "./behaviors/MoveBehavior.ts";
import { DrawBehavior } from "./behaviors/DrawBehavior.ts";

interface CameraViewProps {
  children: ComponentChildren;
}

export default function CameraView(
  { children }: CameraViewProps,
) {
  const camera = useContext(CameraContext);
  return (
    <div
      style={{
        position: "absolute",
        width: "0px",
        height: "0px",
        transform:
          `scale(${camera.value.scale}) translate(${camera.value.dx}px, ${camera.value.dy}px)`,
      }}
    >
      <CameraContext.Provider value={camera}>
        {children}
      </CameraContext.Provider>
    </div>
  );
}

import { ComponentChildren, useContext } from "../../../deps_client.ts";
import { CameraContext } from "../../../client/camera.ts";

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

import { Camera } from "../../../client/camera.ts";
import { ComponentChildren } from "preact";
import { Signal } from "@preact/signals";

interface CameraViewProps {
  camera: Signal<Camera>;
  children: ComponentChildren;
}

export default function CameraView({ camera, children }: CameraViewProps) {
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
      {children}
    </div>
  );
}

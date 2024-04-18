import { Camera } from "../../../client/camera.ts";
import { ComponentChildren } from "preact";
import { Signal } from "@preact/signals";
import { CameraContext } from "../../../client/camera.ts";
import { useEffect } from "preact/hooks";

interface CameraViewProps {
  camera: Signal<Camera>;
  children: ComponentChildren;
}

export default function CameraView({ camera, children }: CameraViewProps) {
  useEffect(() => {
    const zoom = (e: WheelEvent) => {
      const amount = e.deltaY;
      if (amount > 0) {
        camera.value = camera.peek().zoom(e.clientX, e.clientY, 1 / 1.1);
      } else {
        camera.value = camera.peek().zoom(e.clientX, e.clientY, 1.1);
      }
    };

    let prevX = 0;
    let prevY = 0;

    const startMove = (e: MouseEvent) => {
      if (e.buttons & 2) {
        prevX = e.clientX;
        prevY = e.clientY;
      }
    };

    const move = (e: MouseEvent) => {
      if (e.buttons & 2) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        prevX = e.clientX;
        prevY = e.clientY;
        camera.value = camera.peek().move(dx, dy);
      }
    };

    let touchX = 0;
    let touchY = 0;
    let touchDist = 1;

    function getTouchData(a: Touch, b: Touch) {
      const touchX = (a.clientX + b.clientX) / 2;
      const touchY = (a.clientY + b.clientY) / 2;
      const touchDist = Math.sqrt(
        Math.pow(a.clientX - b.clientX, 2) + Math.pow(a.clientY - b.clientY, 2),
      );
      return [touchX, touchY, touchDist];
    }

    const touchStart = (e: TouchEvent) => {
      if (e.touches.length < 2) return;
      e.preventDefault();
      const [x, y, d] = getTouchData(e.touches[0], e.touches[1]);
      touchX = x;
      touchY = y;
      touchDist = d;
    };

    const touchMove = (e: TouchEvent) => {
      if (e.touches.length < 2) return;
      e.preventDefault();
      const [x, y, d] = getTouchData(e.touches[0], e.touches[1]);
      camera.value = camera.peek().move(
        x - touchX,
        y - touchY,
      ).zoom(
        x,
        y,
        d / touchDist,
      );
      touchX = x;
      touchY = y;
      touchDist = d;
    };

    const prevent = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    globalThis.addEventListener("gesturestart", prevent);
    globalThis.addEventListener("contextmenu", prevent);

    globalThis.addEventListener("wheel", zoom);
    globalThis.addEventListener("mousemove", move);
    globalThis.addEventListener("mousedown", startMove);
    globalThis.addEventListener("touchstart", touchStart);
    globalThis.addEventListener("touchmove", touchMove);

    return () => {
      globalThis.removeEventListener("gesturestart", prevent);
      globalThis.removeEventListener("contextmenu", prevent);

      globalThis.removeEventListener("wheel", zoom);
      globalThis.removeEventListener("mousemove", move);
      globalThis.removeEventListener("mousedown", startMove);
      globalThis.removeEventListener("touchstart", touchStart);
      globalThis.removeEventListener("touchmove", touchMove);
    };
  }, []);

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

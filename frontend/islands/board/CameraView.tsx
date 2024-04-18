import { Camera } from "../../../client/camera.ts";
import { ComponentChildren } from "preact";
import { Signal } from "@preact/signals";
import { CameraContext } from "../../../client/camera.ts";
import { useContext, useEffect } from "preact/hooks";
import { SettingsContext } from "../../../client/settings.ts";

interface CameraViewProps {
  camera: Signal<Camera>;
  children: ComponentChildren;
}

export default function CameraView({ camera, children }: CameraViewProps) {
  const stylusMode = useContext(SettingsContext).stylusMode;

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
      e.preventDefault();
      if (stylusMode.peek() && e.touches.length == 1) {
        touchX = e.touches[0].clientX;
        touchY = e.touches[0].clientY;
        touchDist = 1;
      }
      if (e.touches.length < 2) return;
      const [x, y, d] = getTouchData(e.touches[0], e.touches[1]);
      touchX = x;
      touchY = y;
      touchDist = d;
    };

    const touchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (stylusMode.peek() && e.touches.length == 1) {
        camera.value = camera.peek().move(
          e.touches[0].clientX - touchX,
          e.touches[0].clientY - touchY,
        );
        touchX = e.touches[0].clientX;
        touchY = e.touches[0].clientY;
      }
      if (e.touches.length < 2) return;
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

    const touchEnd = (e: TouchEvent) => {
      if (stylusMode.peek() && e.touches.length == 1) {
        touchX = e.touches[0].clientX;
        touchY = e.touches[0].clientY;
      }
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
    globalThis.addEventListener("touchend", touchEnd);

    return () => {
      globalThis.removeEventListener("gesturestart", prevent);
      globalThis.removeEventListener("contextmenu", prevent);

      globalThis.removeEventListener("wheel", zoom);
      globalThis.removeEventListener("mousemove", move);
      globalThis.removeEventListener("mousedown", startMove);
      globalThis.removeEventListener("touchstart", touchStart);
      globalThis.removeEventListener("touchmove", touchMove);
      globalThis.removeEventListener("touchend", touchEnd);
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

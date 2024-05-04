import {
  ComponentChildren,
  Signal,
  useContext,
  useEffect,
  useRef,
} from "../../../deps_client.ts";
import { Camera } from "../../../client/camera.ts";
import { CameraContext } from "../../../client/camera.ts";
import { SettingsContext } from "../../../client/settings.ts";

interface CameraViewProps {
  camera: Signal<Camera>;
  children: ComponentChildren;
}

export default function CameraView(
  { camera, children }: CameraViewProps,
) {
  const stylusMode = useContext(SettingsContext).stylusMode;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let touchpad = false;
    const zoom = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.deltaX !== 0 || Math.abs(e.deltaY) < 50) {
        touchpad = true;
      }

      if (!touchpad || e.ctrlKey) {
        const amount = e.deltaY;
        camera.value = camera.peek().zoom(
          e.clientX,
          e.clientY,
          Math.pow(1.1, -Math.sign(amount)),
        );
      } else {
        camera.value = camera.peek().move(e.deltaX, e.deltaY);
      }
    };

    let prevX = 0;
    let prevY = 0;
    let touchX = 0;
    let touchY = 0;
    let touchDist = 1;
    let moving = false;
    let mouseMoving = false;

    const move = (e: MouseEvent) => {
      if (e.buttons & 2) {
        moving = false;
        if (!mouseMoving) {
          mouseMoving = true;
          prevX = e.clientX;
          prevY = e.clientY;
          return;
        }
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        prevX = e.clientX;
        prevY = e.clientY;
        camera.value = camera.peek().move(dx, dy);
      } else {
        mouseMoving = false;
      }
    };

    const endMove = (e: MouseEvent) => {
      mouseMoving = false;
    };

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
      if (mouseMoving) return;
      moving = true;
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
      if (!moving) return;
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
      moving = false;
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

    globalThis.addEventListener("wheel", zoom, { passive: false });
    globalThis.addEventListener("mousemove", move);
    globalThis.addEventListener("mouseup", endMove);
    ref.current?.addEventListener("touchstart", touchStart);
    globalThis.addEventListener("touchmove", touchMove);
    globalThis.addEventListener("touchend", touchEnd);

    return () => {
      globalThis.removeEventListener("gesturestart", prevent);
      globalThis.removeEventListener("contextmenu", prevent);
      globalThis.removeEventListener("wheel", zoom);
      globalThis.removeEventListener("mousemove", move);
      globalThis.removeEventListener("mouseup", endMove);
      globalThis.removeEventListener("touchmove", touchMove);
      globalThis.removeEventListener("touchend", touchEnd);
    };
  }, []);

  return (
    <div
      style={{
        overflow: "hidden",
        width: "100%",
        height: "100%",
        position: "absolute",
      }}
      ref={ref}
    >
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
    </div>
  );
}

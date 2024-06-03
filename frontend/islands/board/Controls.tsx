import {
  ComponentChildren,
  Signal,
  useContext,
  useEffect,
  useRef,
} from "../../../deps_client.ts";
import { Camera, CameraContext } from "../../../client/camera.ts";
import { SettingsContext, Tool } from "../../../client/settings.ts";
import { ClientContext } from "../app/WithClient.tsx";
import { Behavior, BehaviorContext } from "./behaviors/Behavior.ts";
import { DrawableCanvas } from "../../../client/canvas.ts";
import { EraseBehavior } from "./behaviors/EraseBehavior.ts";
import { MoveBehavior } from "./behaviors/MoveBehavior.ts";
import { DrawBehavior } from "./behaviors/DrawBehavior.ts";
import { SelectBehavior } from "./behaviors/SelectBehavior.ts";

interface CameraViewProps {
  controls: DrawableCanvas;
}

export default function Controls({ controls }: CameraViewProps) {
  const stylusMode = useContext(SettingsContext).stylusMode;
  const ref = useRef<HTMLDivElement>(null);
  const client = useContext(ClientContext);
  const settings = useContext(SettingsContext);
  const camera = useContext(CameraContext);
  if (!client) return <></>;

  const behaviorContext = new BehaviorContext(settings, controls, client!);

  useEffect(() => {
    let behavior: Behavior = new DrawBehavior(behaviorContext);

    settings.tool.subscribe((tool) => {
      switch (tool) {
        case Tool.PEN:
          behavior = new DrawBehavior(behaviorContext);
          break;
        case Tool.ERASER:
          behavior = new EraseBehavior(behaviorContext);
          break;
        case Tool.MOVE:
          behavior = new MoveBehavior(behaviorContext);
          break;
        case Tool.SELECT:
          behavior = new SelectBehavior(behaviorContext);
          break;
      }
    });

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
    let toolDown = false;

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

    const mouseDown = (event: MouseEvent) => {
      if (client?.ui.viewerOnly) return;
      if (event.button != 0) return;
      if (toolDown) return;
      toolDown = true;
      const [x, y] = camera.peek().toBoardCoords(event.clientX, event.clientY);
      behavior.toolStart({ x, y });
    };

    const mouseMove = (event: MouseEvent) => {
      if (client?.ui.viewerOnly) return;
      if (!toolDown) return;
      const [x, y] = camera.peek().toBoardCoords(event.clientX, event.clientY);
      behavior.toolMove({ x, y });
    };

    const mouseUp = (event: MouseEvent) => {
      if (client?.ui.viewerOnly) return;
      if (!toolDown) return;
      toolDown = false;
      behavior.toolEnd();
    };

    const touchStart2 = (event: TouchEvent) => {
      if (client?.ui.viewerOnly) return;
      if (stylusMode.peek()) return;
      if (event.touches.length != 1) {
        if (!toolDown) return;
        toolDown = false;
        behavior.toolCancel();
        return;
      }
      event.preventDefault();
      const [x, y] = camera.peek().toBoardCoords(
        event.touches[0].clientX,
        event.touches[0].clientY,
      );
      if (toolDown) return;
      toolDown = true;
      behavior.toolStart({ x, y });
    };

    const touchMove2 = (event: TouchEvent) => {
      if (client?.ui.viewerOnly) return;
      if (event.touches.length != 1) return;
      if (!toolDown) return;
      event.preventDefault();
      const [x, y] = camera.peek().toBoardCoords(
        event.touches[0].clientX,
        event.touches[0].clientY,
      );
      behavior.toolMove({ x, y });
    };

    const touchEnd2 = () => {
      if (client?.ui.viewerOnly) return;
      if (!toolDown) return;
      toolDown = false;
      behavior.toolEnd();
    };

    globalThis.addEventListener("keydown", (e) => {
      if (e.key === "Shift") {
        if (settings.tool.peek() === Tool.MOVE) {
          settings.tool.value = Tool.SELECT;
        }
      }
    });

    globalThis.addEventListener("keyup", (e) => {
      if (e.key === "Shift") {
        if (settings.tool.peek() === Tool.SELECT) {
          settings.tool.value = Tool.MOVE;
        }
      }
    });

    ref.current!.addEventListener("touchstart", touchStart2);
    globalThis.addEventListener("touchend", touchEnd2);
    globalThis.addEventListener("touchcancel", touchEnd2);
    globalThis.addEventListener("touchmove", touchMove2);
    ref.current!.addEventListener("mousedown", mouseDown);
    globalThis.addEventListener("mouseup", mouseUp);
    globalThis.addEventListener("mousemove", mouseMove);

    globalThis.addEventListener("gesturestart", prevent);
    globalThis.addEventListener("contextmenu", prevent);

    globalThis.addEventListener("wheel", zoom, { passive: false });
    globalThis.addEventListener("mousemove", move);
    globalThis.addEventListener("mouseup", endMove);
    globalThis.addEventListener("touchstart", touchStart);
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
    </div>
  );
}

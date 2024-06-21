import {
  createContext,
  signal,
  useContext,
  useEffect,
  useRef,
} from "../../../deps_client.ts";
import { CameraContext } from "../../../client/camera.ts";
import {
  EnterTextContext,
  Mode,
  OnEnterContext,
  SettingsContext,
  Tool,
} from "../../../client/settings.ts";
import { ClientContext } from "../app/WithClient.tsx";
import { Behavior, BehaviorContext } from "./behaviors/Behavior.ts";
import { DrawableCanvas } from "../../../client/canvas.ts";
import { EraseBehavior } from "./behaviors/EraseBehavior.ts";
import { MoveBehavior } from "./behaviors/MoveBehavior.ts";
import { DrawBehavior } from "./behaviors/DrawBehavior.ts";
import { LineBehavior } from "./behaviors/LineBehaviour.ts";
import { EllipseBehavior } from "./behaviors/EllipseBehaviour.ts";
import { RectangleBehavior } from "./behaviors/RectangleBehaviour.ts";
import { PolylineBehaviour } from "./behaviors/PolyLineBehaviour.ts";
import { PolygonBehavior } from "./behaviors/PolygonBehaviour.ts";
import { Line, Point } from "../../../liaison/liaison.ts";
import { paste } from "./PasteSelector.tsx";

export const HideContext = createContext(signal(false));

interface CameraViewProps {
  controls: DrawableCanvas;
}

const drawButton = 0;
const eraseButton = 2;
const cameraButton = 4;

export default function Controls({ controls }: CameraViewProps) {
  const stylusMode = useContext(SettingsContext).stylusMode;
  const ref = useRef<HTMLDivElement>(null);
  const client = useContext(ClientContext);
  const settings = useContext(SettingsContext);
  const camera = useContext(CameraContext);
  const onEnter = useContext(OnEnterContext);
  const enterText = useContext(EnterTextContext);
  const hide = useContext(HideContext);
  if (!client) return <></>;

  const behaviorContext = new BehaviorContext(
    settings,
    controls,
    client!,
    onEnter,
    enterText,
  );
  let shift = false;

  useEffect(() => {
    let behavior: Behavior = new DrawBehavior(behaviorContext);
    const getDrawBehaviour = (tool: Tool): Behavior => {
      switch (tool) {
        case Tool.PEN:
          return new DrawBehavior(behaviorContext);
        case Tool.LINE:
          return new LineBehavior(behaviorContext);
        case Tool.ELLIPSE:
          return new EllipseBehavior(behaviorContext);
        case Tool.RECTANGLE:
          return new RectangleBehavior(behaviorContext);
        case Tool.POLYGON:
          return new PolygonBehavior(behaviorContext);
        case Tool.POLYLINE:
          return new PolylineBehaviour(behaviorContext);
      }
    };

    settings.tool.subscribe((tool) => {
      if (settings.mode.peek() == Mode.DRAW) {
        behavior = getDrawBehaviour(tool);
        behavior.setShift(shift);
      }
    });

    settings.mode.subscribe((mode) => {
      switch (mode) {
        case Mode.DRAW:
          behavior = getDrawBehaviour(settings.tool.value);
          behavior.setShift(shift);
          break;
        case Mode.ERASE:
          behavior = new EraseBehavior(behaviorContext);
          break;
        case Mode.MOVE:
          behavior = new MoveBehavior(behaviorContext);
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
        camera.value = camera
          .peek()
          .zoom(e.clientX, e.clientY, Math.pow(1.1, -Math.sign(amount)));
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

    let mouseX = 0;
    let mouseY = 0;

    const move = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (e.buttons & cameraButton) {
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

    const hideMenus = () => {
      hide.value = !hide.peek();
    };

    const touchStart = (e: TouchEvent) => {
      hideMenus();
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
        camera.value = camera
          .peek()
          .move(e.touches[0].clientX - touchX, e.touches[0].clientY - touchY);
        touchX = e.touches[0].clientX;
        touchY = e.touches[0].clientY;
      }
      if (e.touches.length < 2) return;
      const [x, y, d] = getTouchData(e.touches[0], e.touches[1]);
      camera.value = camera
        .peek()
        .move(x - touchX, y - touchY)
        .zoom(x, y, d / touchDist);
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

    let cameraButtonReleaseTime = 0;

    const mouseDown = (event: MouseEvent) => {
      hideMenus();
      if (client?.ui.viewerOnly) return;
      event.preventDefault();
      if (event.button == eraseButton) {
        prevMode = settings.mode.peek();
        settings.mode.value = Mode.ERASE;
      }
      if (event.button != drawButton && event.button != eraseButton) return;
      if (toolDown) return;
      toolDown = true;
      const [x, y] = camera.peek().toBoardCoords(event.clientX, event.clientY);
      behavior.toolStart({ x, y });
    };

    let prevMode: Mode | null = null;

    const mouseMove = (event: MouseEvent) => {
      if (client?.ui.viewerOnly) return;
      if (
        settings.mode.peek() == Mode.DRAW &&
        (settings.tool.peek() == Tool.POLYLINE ||
          settings.tool.peek() == Tool.POLYGON)
      ) {
        const [x, y] = camera
          .peek()
          .toBoardCoords(event.clientX, event.clientY);

        behavior.toolMove({ x, y });
        return;
      }
      if (!toolDown) return;
      const [x, y] = camera.peek().toBoardCoords(event.clientX, event.clientY);
      behavior.toolMove({ x, y });
    };

    const mouseUp = (event: MouseEvent) => {
      if (client?.ui.viewerOnly) return;
      cameraButtonReleaseTime = Date.now();
      if (!toolDown) return;
      toolDown = false;
      behavior.toolEnd();
      if (prevMode !== null) {
        settings.mode.value = prevMode;
        prevMode = null;
      }
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
      const [x, y] = camera
        .peek()
        .toBoardCoords(event.touches[0].clientX, event.touches[0].clientY);
      if (toolDown) return;
      toolDown = true;
      behavior.toolStart({ x, y });
    };

    const touchMove2 = (event: TouchEvent) => {
      if (client?.ui.viewerOnly) return;
      if (event.touches.length != 1) return;
      if (!toolDown) return;
      event.preventDefault();
      const [x, y] = camera
        .peek()
        .toBoardCoords(event.touches[0].clientX, event.touches[0].clientY);
      behavior.toolMove({ x, y });
    };

    const touchEnd2 = () => {
      if (client?.ui.viewerOnly) return;
      if (!toolDown) return;
      toolDown = false;
      behavior.toolEnd();
    };
    const keydown = (e: KeyboardEvent) => {
      if (e.shiftKey) {
        shift = true;
        behavior.setShift(shift);
      }
      if (e.key === "Enter" || e.key === "Escape") {
        onEnter.peek()?.call(null);
      }
    };

    const keyup = (e: KeyboardEvent) => {
      if (!e.shiftKey) {
        shift = false;
        behavior.setShift(shift);
      }
    };

    globalThis.addEventListener("paste", () => {
      console.log(cameraButtonReleaseTime);
      if (Date.now() - cameraButtonReleaseTime < 100) return;
      paste(mouseX, mouseY, client, camera.peek(), settings);
    });

    globalThis.addEventListener("keydown", (e) => {
      if (e.key === "Delete") {
        client.socket.deleteSelection();
      }
    });

    globalThis.addEventListener("resize", (_) => {
      controls.redraw();
    });
    globalThis.addEventListener("keydown", (e) => {
      if (e.key === "z" && e.ctrlKey) {
        client.socket.undo();
      }
      if (e.key === "Z" && e.ctrlKey) {
        client.socket.redo();
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
    ref.current!.addEventListener("touchstart", touchStart);
    globalThis.addEventListener("touchmove", touchMove);
    globalThis.addEventListener("touchend", touchEnd);

    globalThis.addEventListener("keydown", keydown);
    globalThis.addEventListener("keyup", keyup);

    return () => {
      globalThis.removeEventListener("gesturestart", prevent);
      globalThis.removeEventListener("contextmenu", prevent);
      globalThis.removeEventListener("wheel", zoom);
      globalThis.removeEventListener("mousemove", move);
      globalThis.removeEventListener("mouseup", endMove);
      globalThis.removeEventListener("touchmove", touchMove);
      globalThis.removeEventListener("touchend", touchEnd);
      globalThis.removeEventListener("keydown", keydown);
      globalThis.removeEventListener("keyup", keyup);
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

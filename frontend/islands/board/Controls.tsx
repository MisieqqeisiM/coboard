import {
  createContext,
  signal,
  useContext,
  useEffect,
  useRef,
} from "../../../deps_client.ts";
import { CameraContext } from "../../../client/camera.ts";
import { Mode, SettingsContext, Tool } from "../../../client/settings.ts";
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
import { SelectBehavior } from "./behaviors/SelectBehavior.ts";
import { Line, Point } from "../../../liaison/liaison.ts";

export const HideContext = createContext(signal(false));

interface CameraViewProps {
  controls: DrawableCanvas;
}

export default function Controls({ controls }: CameraViewProps) {
  const stylusMode = useContext(SettingsContext).stylusMode;
  const ref = useRef<HTMLDivElement>(null);
  const client = useContext(ClientContext);
  const settings = useContext(SettingsContext);
  const camera = useContext(CameraContext);
  const hide = useContext(HideContext);
  if (!client) return <></>;

  const behaviorContext = new BehaviorContext(settings, controls, client!);
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
        case Mode.SELECT:
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

    const mouseDown = (event: MouseEvent) => {
      hideMenus();
      if (client?.ui.viewerOnly) return;
      if (event.button != 0) return;
      if (toolDown) return;
      toolDown = true;
      const [x, y] = camera.peek().toBoardCoords(event.clientX, event.clientY);
      behavior.toolStart({ x, y });
    };

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
    };

    const keyup = (e: KeyboardEvent) => {
      if (!e.shiftKey) {
        shift = false;
        behavior.setShift(shift);
      }
    };

    globalThis.addEventListener("copy", (_) => {
      if (client.ui.selection.peek().size == 0) return;
      navigator.clipboard.writeText(
        `coboard:${
          JSON.stringify(Array.from(client.ui.selection.peek().values()))
        }`,
      );
    });

    globalThis.addEventListener("paste", (e) => {
      if (!e.clipboardData || !e.clipboardData.types) return;
      const text = e.clipboardData.getData("Text");
      if (!text.startsWith("coboard:")) return;
      const data = JSON.parse(text.slice(8));
      if (!Array.isArray(data)) return;
      const lines: Line[] = [];
      const middle = { x: 0, y: 0 };
      let n = 0;

      for (const obj of data) {
        const id = obj["id"];
        const width = obj["width"];
        const color = obj["color"];
        const coordinates = obj["coordinates"];
        if (typeof id !== "number") return;
        if (typeof width !== "number") return;
        if (typeof color !== "string") return;
        if (!color.match("#[0-9a-fA-F]{6}")) return;
        if (!Array.isArray(coordinates)) return;
        const newCoords: Point[] = [];
        for (const point of coordinates) {
          const x = point["x"];
          const y = point["y"];
          if (typeof x != "number") return;
          if (typeof y != "number") return;
          newCoords.push({ x, y });
          n++;
          middle.x += x;
          middle.y += y;
        }
        lines.push(new Line(id, width, color, newCoords));
      }

      middle.x /= n;
      middle.y /= n;

      client.socket.deselectAll();

      const [mx, my] = camera.peek().toBoardCoords(mouseX, mouseY);
      const diff = {
        x: mx - middle.x,
        y: my - middle.y,
      };
      const newLines = lines.map((l) => Line.move(l, diff));
      client.socket.drawToSelection(newLines);
      settings.mode.value = Mode.MOVE;
    });

    globalThis.addEventListener("keydown", (e) => {
      if (e.key === "Shift") {
        if (settings.mode.peek() === Mode.MOVE) {
          settings.mode.value = Mode.SELECT;
        }
      } else if (e.key === "Delete") {
        client.socket.deleteSelection();
      }
    });

    globalThis.addEventListener("keyup", (e) => {
      if (e.key === "Shift") {
        if (settings.mode.peek() === Mode.SELECT) {
          settings.mode.value = Mode.MOVE;
        }
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

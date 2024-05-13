import { useContext, useEffect, useRef } from "../../../deps_client.ts";
import { Client } from "../../../client/client.ts";
import { CameraContext } from "../../../client/camera.ts";
import {
  EraserColor,
  SettingsContext,
  Tool,
} from "../../../client/settings.ts";
import { Line } from "../../../liaison/liaison.ts";

interface CanvasProps {
  client: Client;
  width: number;
  height: number;
}

export default function DrawableCanvas(props: CanvasProps) {
  const camera = useContext(CameraContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tool = useContext(SettingsContext).tool;
  const stroke_color = useContext(SettingsContext).color;
  const stroke_width = useContext(SettingsContext).size;
  const stylusMode = useContext(SettingsContext).stylusMode;
  let points: { x: number; y: number }[] = [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let drawing = false;

    const startDraw = (x: number, y: number) => {
      drawing = true;
      points = [{ x: x, y: y }];
      context.beginPath();
      context.lineWidth = stroke_width.peek();

      if (tool.peek() == Tool.PEN) {
        context.strokeStyle = stroke_color.peek();
      } else {
        context.strokeStyle = EraserColor.WHITE;
      }

      context.moveTo(x, y);
    };

    const draw = (x: number, y: number) => {
      if (!drawing) return;
      points.push({ x: x, y: y });
      context.lineTo(x, y);
      context.stroke();
    };

    const endDraw = () => {
      if (drawing) {
        drawing = false;
        context.closePath();
        if (tool.peek() == Tool.PEN) {
          const line: Line = new Line(
            stroke_width.peek(),
            stroke_color.peek(),
            points,
          );
          props.client.ui.local_strokes.value.push(line);
          props.client.socket.draw(line);
        } else {
          props.client.ui.local_strokes.value.push(
            new Line(stroke_width.peek(), EraserColor.WHITE, points),
          );
          props.client.socket.draw(
            new Line(stroke_width.peek(), EraserColor.TRANSPARENT, points),
          );
        }
        points = [];
      }
    };

    const mouseDown = (event: MouseEvent) => {
      if (event.button != 0) return;
      startDraw(event.offsetX, event.offsetY);
    };

    const mouseMove = (event: MouseEvent) => {
      draw(...camera.peek().toBoardCoords(event.clientX, event.clientY));
    };

    const mouseUp = () => {
      endDraw();
    };

    const touchStart = (event: TouchEvent) => {
      if (stylusMode.peek()) return;
      if (event.touches.length != 1) return;
      event.preventDefault();
      startDraw(
        ...camera.peek().toBoardCoords(
          event.touches[0].clientX,
          event.touches[0].clientY,
        ),
      );
    };

    const touchMove = (event: TouchEvent) => {
      if (event.touches.length != 1) return;
      event.preventDefault();
      draw(
        ...camera.peek().toBoardCoords(
          event.touches[0].clientX,
          event.touches[0].clientY,
        ),
      );
    };

    const touchEnd = () => {
      endDraw();
    };

    canvas.addEventListener("touchstart", touchStart);
    globalThis.addEventListener("touchend", touchEnd);
    globalThis.addEventListener("touchcancel", touchEnd);
    globalThis.addEventListener("touchmove", touchMove);
    canvas.addEventListener("mousedown", mouseDown);
    globalThis.addEventListener("mouseup", mouseUp);
    globalThis.addEventListener("mousemove", mouseMove);

    return () => {
      canvas.removeEventListener("touchstart", touchStart);
      globalThis.removeEventListener("touchend", touchEnd);
      globalThis.removeEventListener("touchcancel", touchEnd);
      globalThis.removeEventListener("touchmove", touchMove);
      canvas.removeEventListener("mousedown", mouseDown);
      globalThis.removeEventListener("mouseup", mouseUp);
      globalThis.removeEventListener("mousemove", mouseMove);
    };
  }, []);

  useEffect(() => {
    const subscription = props.client.ui.local_strokes.subscribe((strokes) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }
      
      context.clearRect(0, 0, canvas.width, canvas.height);
      const draw_line = (line: Line) => {
        if (line && line.coordinates && line.coordinates.length > 1) {
          context.beginPath();
          context.strokeStyle = line.color;
          context.lineWidth = line.width;
          context.moveTo(line.coordinates[0].x, line.coordinates[0].y);
          for (let j = 1; j < line.coordinates.length; j++) {
            context.lineTo(line.coordinates[j].x, line.coordinates[j].y);
            context.stroke();
          }
          context.closePath();
        }
      };

      draw_line(new Line(stroke_width.peek(), stroke_color.peek(), points));
      if (
        (!props.client.ui.local_strokes) ||
        (!props.client.ui.local_strokes.value)
      ) {
        return;
      }

      props.client.ui.local_strokes.value.forEach(draw_line);
    });
    return () => {
      // TODO: unsubscribe
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", left: 0, top: 0, height:'100%', width:'100%'}}
    />
  );
}

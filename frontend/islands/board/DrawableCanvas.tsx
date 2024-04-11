import { useEffect, useRef } from "preact/hooks";
import { Client } from "../../../client/client.ts";
import { Camera } from "../../../client/camera.ts";
import { Signal } from "@preact/signals";

interface CanvasProps {
  client: Client;
  camera: Signal<Camera>;
  width: number;
  height: number;
}

export default function DrawableCanvas(props: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    let points: { x: number; y: number }[];

    const startDraw = (x: number, y: number) => {
      drawing = true;
      points = [{ x: x, y: y }];
      context.beginPath();
      context.lineWidth = 3;
      context.strokeStyle = "black";
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
        props.client.socket.draw(points);
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    const mouseDown = (event: MouseEvent) => {
      if (event.button != 0) return;
      startDraw(event.offsetX, event.offsetY);
    };

    const mouseMove = (event: MouseEvent) => {
      draw(...props.camera.peek().toBoardCoords(event.clientX, event.clientY));
    };

    const mouseUp = () => {
      endDraw();
    };

    const touchStart = (event: TouchEvent) => {
      if (event.touches.length != 1) return;
      startDraw(
        ...props.camera.peek().toBoardCoords(
          event.touches[0].clientX,
          event.touches[0].clientY,
        ),
      );
    };

    const touchMove = (event: TouchEvent) => {
      if (event.touches.length != 1) return;
      draw(
        ...props.camera.peek().toBoardCoords(
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
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", left: 0, top: 0 }}
      width={`${props.width}px`}
      height={`${props.height}px`}
    />
  );
}

import { useEffect, useRef } from "preact/hooks";
import { Client } from "../../../client/client.ts";
interface CanvasProps {
  client: Client;
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

    const startDraw = (event: MouseEvent) => {
      if (event.button != 0) return;
      drawing = true;
      const x = event.offsetX;
      const y = event.offsetY;
      points = [{ x: x, y: y }];
      context.beginPath();
      context.lineWidth = 3;
      context.strokeStyle = "black";
      context.moveTo(x, y);
    };

    const draw = (event: MouseEvent) => {
      if (!drawing) {
        return;
      }
      const x = event.offsetX;
      const y = event.offsetY;
      points.push({ x: x, y: y });
      context.lineTo(x, y);
      context.stroke();
    };

    const endDraw = () => {
      drawing = false;
      context.closePath();
      props.client.socket.draw(points);
      context.clearRect(0, 0, canvas.width, canvas.height);
    };

    canvas.addEventListener("mousedown", startDraw);
    globalThis.addEventListener("mouseup", endDraw);
    globalThis.addEventListener("mousemove", draw);

    return () => {
      canvas.removeEventListener("mousedown", startDraw);
      globalThis.removeEventListener("mouseup", endDraw);
      globalThis.removeEventListener("mousemove", draw);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", left: 0, top: 0 }}
      width="600px"
      height="300px"
    />
  );
}

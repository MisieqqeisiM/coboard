import { useEffect, useRef } from "preact/hooks";
import { Client } from "../../../client/client.ts";
import { Line } from "../../../liaison/liaison.ts";

interface CanvasProps {
  client: Client;
  width: number;
  height: number;
}

export default function ObservableCanvas(props: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const subscription = props.client.ui.strokes.subscribe((strokes) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      while (
        props.client.ui.strokes && props.client.ui.strokes.value &&
        props.client.ui.strokes.value.length > 0
      ) {
        //inefficient, should be a proper queue
        const line: Line | undefined = props.client.ui
          .strokes.value
          .shift();
        if (line && line.coordinates && line.coordinates.length > 1) {
          context.beginPath();
          context.lineWidth = line.width;
          context.strokeStyle = line.color;
          context.moveTo(line.coordinates[0].x, line.coordinates[0].y);
          for (let j = 1; j < line.coordinates.length; j++) {
            context.lineTo(line.coordinates[j].x, line.coordinates[j].y);
            context.stroke();
          }
          context.closePath();
        }
      }
    });
    return () => {
      // TODO: unsubscribe
    };
  }, []);

  useEffect(() => {
    const subscription = props.client.ui.clear.subscribe((newValue) => {
      if (newValue) {
        props.client.ui.clear.value = false;
        const canvas = canvasRef.current;
        if (!canvas) {
          return;
        }
        const context = canvas.getContext("2d");
        if (!context) {
          return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    });
    return () => {
      // TODO: unsubscribe
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

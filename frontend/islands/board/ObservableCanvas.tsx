import { useEffect, useRef } from "../../../deps.ts";
import { Client } from "../../../client/client.ts";
import { EraserColor } from "../../../client/settings.ts";

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

      for (const line of strokes) {
        //inefficient, should be a proper queue
        if (line && line.coordinates && line.coordinates.length > 1) {
          //temporary solution
          if (line.color == EraserColor.TRANSPARENT) {
            context.globalCompositeOperation = "destination-out";
          } else {
            context.globalCompositeOperation = "source-over";
          }

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
      }
      props.client.ui.strokes.peek().length = 0;
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

import { useEffect, useRef } from "preact/hooks";
import { Client } from "../../../client/client.ts";
interface CanvasProps {
  client: Client;
  width: number;
  height: number;
}

export default function ObservableCanvas(props: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    let context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    while (
      props.client.ui.strokes && props.client.ui.strokes.value &&
      props.client.ui.strokes.value.length > 0
    ) {
      //inefficient, should be a proper queue
      const line: { x: number; y: number }[] = props.client.ui.strokes.value
        .shift();
      if (line && line.length > 1) {
        context.beginPath();
        context.lineWidth = 3;
        context.strokeStyle = "black";
        context.moveTo(line[0].x, line[0].y);
        for (let j = 1; j < line.length; j++) {
          context.lineTo(line[j].x, line[j].y);
          context.stroke();
        }
        context.closePath();
      }
    }
  }, props.client.ui.strokes?.value);
  
  useEffect(()=>{
    if(props.client.ui.clear.value) {
      props.client.ui.clear.value=false;
      const canvas = canvasRef.current;
      if(!canvas)
        return;
      const context = canvas.getContext("2d");
      if(!context)
        return;

      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, props.client.ui.clear.value);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", left: 0, top: 0 }}
      width={`${props.width}px`}
      height={`${props.height}px`}
    />
  );
}

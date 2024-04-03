import { ClientContext } from "./WithClient.tsx";
import { useRef, useEffect } from 'preact/hooks';
import { Client } from "../../client/client.ts";
interface CanvasProps{
    client: Client;
}

export default function ObservableCanvas(props: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    //props.client.socket.ping();
    useEffect(() => {
        props.client.socket.ping();
        let canvas = canvasRef.current;
        if(!canvas)
            return;
        let context = canvas.getContext('2d');
        if(!context)
            return;

        for (let i = 0; i < props.client.ui.strokes.value.length; i++) {
            let line: { x: number, y: number }[] = props.client.ui.strokes.value[i];
            context.beginPath();
            context.lineWidth = 3;
            context.strokeStyle = 'black';
            context.moveTo(line[0].x, line[0].y);
            for (let j = 1; j < line.length; j++) {
                context.lineTo(line[j].x, line[j].y);
                context.stroke();
            }
            context.closePath();
        }
    }, props.client.ui.strokes.value);
    
    return <canvas ref={canvasRef} height='300px' width='300px' />;
}
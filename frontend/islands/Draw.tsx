import { ClientContext } from "./WithClient.tsx";
import { useRef, useEffect } from 'preact/hooks';
import { Client } from "../../client/client.ts";
interface CanvasProps{
    client: Client;
}

export default function Draw (props: CanvasProps){
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(()=> {
        const canvas = canvasRef.current;
        if(!canvas)
            return;

        const context = canvas.getContext('2d');
        if(!context)
            return;

        let drawing = false;
        let points: {x:number, y:number}[];

        const startDraw = (event: MouseEvent) => {
            drawing = true;
            let x = event.clientX - canvas.offsetLeft;
            let y = event.clientY - canvas.offsetTop;
            points=[{x: x, y: y}];
            context.beginPath();
            context.lineWidth = 3;
            context.strokeStyle='black';
            context.moveTo(x,y);
        };

       const draw = (event: MouseEvent) => {
            if(!drawing)
                return;
            const x = event.clientX - canvas.offsetLeft;
            const y = event.clientY - canvas.offsetTop;
            points.push({x:x, y:y});
            context.lineTo(x,y);
            context.stroke();
        };

        const endDraw = () => {
            drawing = false;
            context.closePath();
            props.client.socket.ping();
            props.client.socket.draw(points);
        };
 
        canvas.addEventListener('mousedown', startDraw);
        canvas.addEventListener('mouseup', endDraw);
        canvas.addEventListener('mousemove', draw);

        return () => {
            canvas.removeEventListener('mousedown', startDraw);
            canvas.removeEventListener('mouseup', endDraw);
            canvas.removeEventListener('mousemove', draw);
        };
    }, []);
    //return <canvas style={{ position: 'absolute', border: '1px solid red', left:0, top:0, width: '100%', height: '100%' }} ref={canvasRef}/>;
    return <canvas ref={canvasRef} width='300px' height='300px'/>;
}


import { Cursor } from "../components/Cursor.tsx";
import MouseTracker from "./MouseTracker.tsx";
import { ClientContext } from "./WithClient.tsx";
import { useRef, useEffect } from 'preact/hooks';

interface CanvasProps{}

const Canvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(()=> {
        const canvas = canvasRef.current;
        if(!canvas)
            return;

        const context = canvas.getContext('2d');
        if(!context)
            return;

        let drawing = false;
        let lastX=0;
        let lastY=0;

        const startDraw = (event: MouseEvent) => {
            drawing = true;
            let x = event.clientX - canvas.offsetLeft;
            let y = event.clientY - canvas.offsetTop;
            context.beginPath();
            context.lineWidth = 3;
            context.strokeStyle='black';
            context.moveTo(x,y);
        };

        const endDraw = () => {
            drawing = false;
            context.closePath();
        };
        const draw = (event: MouseEvent) => {
            if(!drawing)
                return;
            const x = event.clientX - canvas.offsetLeft;
            const y = event.clientY - canvas.offsetTop;
            context.lineTo(x,y);
            context.stroke();
            lastX=x;
            lastY=y;
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
    return <canvas ref={canvasRef} width={800} height={600} />;
};

export default Canvas;

import { useContext, useEffect } from "../../../deps.ts";
import { Client } from "../../../client/client.ts";
import { CameraContext } from "../../../client/camera.ts";

export interface Transformer {
  transform(x: number, y: number): [number, number];
}

interface MouseTrackerProps {
  client: Client;
}

export default function MouseTracker(props: MouseTrackerProps) {
  const camera = useContext(CameraContext);
  useEffect(() => {
    let x = 0;
    let y = 0;
    let lastX = 0;
    let lastY = 0;
    const f1 = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };
    const f2 = (e: TouchEvent) => {
      if (e.touches.length != 1) return;
      e.preventDefault();
      x = e.touches[0].clientX ?? 0;
      y = e.touches[0].clientY ?? 0;
    };
    globalThis.addEventListener("mousemove", f1);
    globalThis.addEventListener("touchmove", f2);
    const interval = setInterval(() => {
      if (lastX == x && lastY == y) return;
      lastX = x;
      lastY = y;
      props.client.socket.move(...camera.peek().toBoardCoords(x, y));
    }, 50);

    return () => {
      globalThis.removeEventListener("mousemove", f1);
      globalThis.removeEventListener("touchmove", f2);
      clearInterval(interval);
    };
  }, []);
  return <></>;
}

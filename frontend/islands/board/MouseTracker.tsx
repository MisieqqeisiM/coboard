import { useEffect } from "preact/hooks";
import { Client } from "../../../client/client.ts";

export interface Transformer {
  transform(x: number, y: number): [number, number];
}

interface MouseTrackerProps {
  client: Client;
  transformer: Transformer;
}

export default function MouseTracker(props: MouseTrackerProps) {
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
      if (e.touches.length != 1) {
        return;
      }
      x = e.touches[0].clientX ?? 0;
      y = e.touches[0].clientY ?? 0;
    };
    globalThis.addEventListener("mousemove", f1);
    globalThis.addEventListener("touchmove", f2);
    const interval = setInterval(() => {
      if (lastX == x && lastY == y) return;
      lastX = x;
      lastY = y;
      props.client.socket.move(...props.transformer.transform(x, y));
    }, 50);

    return () => {
      globalThis.removeEventListener("mousemove", f1);
      globalThis.removeEventListener("touchmove", f2);
      clearInterval(interval);
    };
  }, []);
  return <></>;
}

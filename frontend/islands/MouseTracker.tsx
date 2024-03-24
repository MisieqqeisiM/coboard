
import { Cursor } from "../components/Cursor.tsx";
import { ClientContext } from "../islands/WithClient.tsx"
import { useEffect, useRef } from "preact/hooks";
import { Client } from "../../liaison/liaison.ts"

interface MouseTrackerProps {
  client: Client,
}

export default function MouseTracker(props: MouseTrackerProps) {
  useEffect(() => {
    let x = 0;
    let y = 0;
    let lastX = 0;
    let lastY = 0;
    globalThis.addEventListener("mousemove", (e) => {
      x = e.clientX;
      y = e.clientY;
    });
    const interval = setInterval(() => {
      if(lastX == x && lastY == y)
        return;
      lastX = x;
      lastY = y;
      props.client.move(x, y);
    }, 100);

    return () => clearInterval(interval);
  });
  return <></>;
}
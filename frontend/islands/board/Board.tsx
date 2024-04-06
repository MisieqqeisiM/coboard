import { ClientContext } from "../app/WithClient.tsx";
import { useContext, useEffect, useState } from "preact/hooks";
import DrawableCanvas from "./DrawableCanvas.tsx";
import ObservableCanvas from "./ObservableCanvas.tsx";
import CursorBox from "./CursorBox.tsx";
import MouseTracker from "./MouseTracker.tsx";
import { Transformer } from "./MouseTracker.tsx";

class MyTransformer implements Transformer {
  constructor(public dx: number, public dy: number, public scale: number) {}
  transform(x: number, y: number): [number, number] {
    return [x / this.scale - this.dx, y / this.scale - this.dy];
  }
}

export default function Board() {
  const client = useContext(ClientContext);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [transformer, setTransformer] = useState(new MyTransformer(0, 0, 1));

  useEffect(() => {
    if (!client) return;
    setTransformer(new MyTransformer(0, 0, 1));
    const zoom = (e: WheelEvent) => {
      const [pivotX, pivotY] = transformer.transform(e.pageX, e.pageY);
      const amount = e.deltaY;
      if (amount > 0) {
        setTranslateX((x) => transformer.dx = (x + pivotX) * 1.1 - pivotX);
        setTranslateY((y) => transformer.dy = (y + pivotY) * 1.1 - pivotY);
        setScale((s) => transformer.scale = s / 1.1);
      } else {
        setTranslateX((x) => transformer.dx = (x + pivotX) / 1.1 - pivotX);
        setTranslateY((y) => transformer.dy = (y + pivotY) / 1.1 - pivotY);
        setScale((s) => transformer.scale = s * 1.1);
      }
    };

    let prevX = 0;
    let prevY = 0;

    const startMove = (e: MouseEvent) => {
      if (e.buttons & 2) {
        prevX = e.pageX;
        prevY = e.pageY;
      }
    };

    const move = (e: MouseEvent) => {
      if (e.buttons & 2) {
        const x = e.pageX;
        const y = e.pageY;
        const deltaX = (x - prevX) / transformer.scale;
        const deltaY = (y - prevY) / transformer.scale;
        prevX = x;
        prevY = y;
        setTranslateX((x) => transformer.dx = x + deltaX);
        setTranslateY((y) => transformer.dy = y + deltaY);
      }
    };

    const preventContextMenu = (e: Event) => {
      e.preventDefault();
    };

    globalThis.addEventListener("wheel", zoom);
    globalThis.addEventListener("mousemove", move);
    globalThis.addEventListener("mousedown", startMove);
    globalThis.addEventListener("contextmenu", preventContextMenu);

    return () => {
      globalThis.removeEventListener("wheel", zoom);
      globalThis.removeEventListener("mousemove", move);
      globalThis.removeEventListener("mousedown", startMove);
      globalThis.removeEventListener("contextmenu", preventContextMenu);
    };
  }, [client]);
  if (client) {
    return (
      <div
        style={{
          position: "absolute",
          width: "0px",
          height: "0px",
          transform:
            `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "600px",
            height: "300px",
            backgroundColor: "green",
          }}
        />
        <ObservableCanvas client={client} />
        <DrawableCanvas client={client} />
        <CursorBox />
        <MouseTracker
          client={client}
          transformer={transformer}
        />
      </div>
    );
  }
  return <>Connecting...</>;
}

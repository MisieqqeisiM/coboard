import { ClientContext } from "../app/WithClient.tsx";
import { useContext, useEffect, useState } from "preact/hooks";
import DrawableCanvas from "./DrawableCanvas.tsx";
import ObservableCanvas from "./ObservableCanvas.tsx";
import CursorBox from "./CursorBox.tsx";
import MouseTracker from "./MouseTracker.tsx";
import { Transformer } from "./MouseTracker.tsx";
import Loading from "../app/Loading.tsx";

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
    function zoomCamera(x: number, y: number, amount: number) {
      const [pivotX, pivotY] = transformer.transform(x, y);
      setTranslateX((x) => transformer.dx = (x + pivotX) / amount - pivotX);
      setTranslateY((y) => transformer.dy = (y + pivotY) / amount - pivotY);
      setScale((s) => transformer.scale = s * amount);
    }
    const zoom = (e: WheelEvent) => {
      const amount = e.deltaY;
      if (amount > 0) {
        zoomCamera(e.clientX, e.clientY, 1 / 1.1);
      } else {
        zoomCamera(e.clientX, e.clientY, 1.1);
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

    function moveCamera(dx: number, dy: number) {
      setTranslateX((x) => transformer.dx = x + dx / transformer.scale);
      setTranslateY((y) => transformer.dy = y + dy / transformer.scale);
    }

    const move = (e: MouseEvent) => {
      if (e.buttons & 2) {
        const dx = e.pageX - prevX;
        const dy = e.pageY - prevY;
        prevX = e.pageX;
        prevY = e.pageY;
        moveCamera(dx, dy);
      }
    };

    let touchX = 0;
    let touchY = 0;
    let touchDist = 1;

    function getTouchData(a: Touch, b: Touch) {
      const touchX = (a.clientX + b.clientX) / 2;
      const touchY = (a.clientY + b.clientY) / 2;
      const touchDist = Math.sqrt(
        Math.pow(a.clientX - b.clientX, 2) + Math.pow(a.clientY - b.clientY, 2),
      );
      return [touchX, touchY, touchDist];
    }

    const touchStart = (e: TouchEvent) => {
      if (e.touches.length == 2) {
        const [x, y, d] = getTouchData(e.touches[0], e.touches[1]);
        touchX = x;
        touchY = y;
        touchDist = d;
      }
    };

    const touchMove = (e: TouchEvent) => {
      if (e.touches.length == 2) {
        const [x, y, d] = getTouchData(e.touches[0], e.touches[1]);
        moveCamera(x - touchX, y - touchY);
        zoomCamera(x, y, d / touchDist);
        touchX = x;
        touchY = y;
        touchDist = d;
      }
    };

    const preventContextMenu = (e: Event) => {
      e.preventDefault();
    };

    globalThis.addEventListener("wheel", zoom);
    globalThis.addEventListener("mousemove", move);
    globalThis.addEventListener("mousedown", startMove);
    globalThis.addEventListener("touchstart", touchStart);
    globalThis.addEventListener("touchmove", touchMove);
    globalThis.addEventListener("contextmenu", preventContextMenu);

    return () => {
      globalThis.removeEventListener("wheel", zoom);
      globalThis.removeEventListener("mousemove", move);
      globalThis.removeEventListener("mousedown", startMove);
      globalThis.removeEventListener("touchstart", touchStart);
      globalThis.removeEventListener("touchmove", touchMove);
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
        <DrawableCanvas client={client} transformer={transformer} />
        <CursorBox />
        <MouseTracker
          client={client}
          transformer={transformer}
        />
      </div>
    );
  }
  return <Loading />;
}

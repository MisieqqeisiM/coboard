import { ClientContext } from "../app/WithClient.tsx";
import { useContext, useEffect } from "preact/hooks";
import DrawableCanvas from "./DrawableCanvas.tsx";
import ObservableCanvas from "./ObservableCanvas.tsx";
import CursorBox from "./CursorBox.tsx";
import MouseTracker from "./MouseTracker.tsx";
import Loading from "../../components/Loading.tsx";
import { Camera } from "../../../client/camera.ts";
import { signal } from "@preact/signals";
import CameraView from "./CameraView.tsx";
import AlreadyLoggedIn from "../../components/AlreadyLoggedIn.tsx";

export default function Board() {
  const width = 2048;
  const height = 2048;

  const client = useContext(ClientContext);
  if (!client) return <Loading />;
  if (!client.allowed) return <AlreadyLoggedIn />;

  const camera = signal(
    new Camera(
      globalThis.window.innerWidth / 2 - width / 2,
      globalThis.window.innerHeight / 2 - height / 2,
      1,
    ),
  );

  useEffect(() => {
    const zoom = (e: WheelEvent) => {
      const amount = e.deltaY;
      if (amount > 0) {
        camera.value = camera.peek().zoom(e.clientX, e.clientY, 1 / 1.1);
      } else {
        camera.value = camera.peek().zoom(e.clientX, e.clientY, 1.1);
      }
    };

    let prevX = 0;
    let prevY = 0;

    const startMove = (e: MouseEvent) => {
      if (e.buttons & 2) {
        prevX = e.clientX;
        prevY = e.clientY;
      }
    };

    const move = (e: MouseEvent) => {
      if (e.buttons & 2) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        prevX = e.clientX;
        prevY = e.clientY;
        camera.value = camera.peek().move(dx, dy);
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
      if (e.touches.length < 2) return;
      e.preventDefault();
      const [x, y, d] = getTouchData(e.touches[0], e.touches[1]);
      touchX = x;
      touchY = y;
      touchDist = d;
    };

    const touchMove = (e: TouchEvent) => {
      if (e.touches.length < 2) return;
      e.preventDefault();
      const [x, y, d] = getTouchData(e.touches[0], e.touches[1]);
      camera.value = camera.peek().move(
        x - touchX,
        y - touchY,
      ).zoom(
        x,
        y,
        d / touchDist,
      );
      touchX = x;
      touchY = y;
      touchDist = d;
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
  }, []);

  return (
    <>
      <CameraView camera={camera}>
        <div class="board" style={{ width, height }}>
          <ObservableCanvas client={client} width={width} height={height} />
          <DrawableCanvas
            client={client}
            camera={camera}
            width={width}
            height={height}
          />
        </div>
        <CursorBox />
        <MouseTracker
          client={client}
          camera={camera}
        />
      </CameraView>
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          margin: 3,
        }}
      >
        <button
          style={{ backgroundColor: "#ffffff" }}
          onClick={() => location.href = "/api/logout"}
        >
          log out
        </button>

        <button
          style={{ backgroundColor: "#ffffff" }}
          onClick={() => location.href = "/"}
        >
          boards
        </button>

        <button
          style={{ backgroundColor: "#ffffff" }}
          onClick={() => client.socket.reset()}
        >
          reset
        </button>
      </div>
    </>
  );
}

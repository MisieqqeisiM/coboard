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

  return (
    <>
      <CameraView camera={camera}>
        <div class="board" style={{ width, height }}>
          <ObservableCanvas client={client} width={width} height={height} />
          <DrawableCanvas client={client} width={width} height={height} />
        </div>
        <CursorBox />
        <MouseTracker client={client} />
      </CameraView>
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          margin: 3,
        }}
      >
        <a class="button" href="/api/logout">log out</a>
        <a class="button" href="/">boards</a>
        <button class="button" onClick={() => client.socket.reset()}>
          reset
        </button>
      </div>
    </>
  );
}

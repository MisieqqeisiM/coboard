import { ClientContext } from "../app/WithClient.tsx";
import { useContext, useEffect, useRef } from "preact/hooks";
import DrawableCanvas from "./DrawableCanvas.tsx";
import ObservableCanvas from "./ObservableCanvas.tsx";
import CursorBox from "./CursorBox.tsx";
import MouseTracker from "./MouseTracker.tsx";
import Loading from "../../components/Loading.tsx";
import { Camera } from "../../../client/camera.ts";
import { signal } from "@preact/signals";
import CameraView from "./CameraView.tsx";
import AlreadyLoggedIn from "../../components/AlreadyLoggedIn.tsx";
import ColorSelector from "./ColorSelector.tsx";
import Toolbar from "./Toolbar.tsx";

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
      <Toolbar />
    </>
  );
}

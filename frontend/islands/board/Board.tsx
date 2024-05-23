import { Signal, signal, useContext } from "../../../deps_client.ts";
import { ClientContext } from "../app/WithClient.tsx";
import ObservableCanvas from "./ObservableCanvas.tsx";
import CursorBox from "./CursorBox.tsx";
import MouseTracker from "./MouseTracker.tsx";
import Loading from "../../components/Loading.tsx";
import { Camera, CameraContext } from "../../../client/camera.ts";
import CameraView from "./CameraView.tsx";
import AlreadyLoggedIn from "../../components/AlreadyLoggedIn.tsx";
import Toolbar from "./Toolbar.tsx";
import ThemeSelector from "../app/ThemeSelector.tsx";
import { Point } from "../../../liaison/liaison.ts";

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

  const startDraw: Signal<Point | null> = signal(null);
  const draw: Signal<Point | null> = signal(null);
  const endDraw: Signal<Point | null> = signal(null);

  return (
    <>
      <CameraContext.Provider value={camera}>
        <ObservableCanvas
          startDraw={startDraw}
          draw={draw}
          endDraw={endDraw}
          width={width}
          height={height}
        />
      </CameraContext.Provider>
      <CameraView
        startDraw={startDraw}
        draw={draw}
        endDraw={endDraw}
        camera={camera}
      >
        <CursorBox />
        <MouseTracker client={client} />
      </CameraView>
      <Toolbar />
      <div style={{ position: "absolute", zIndex: 101, right: 10, top: 10 }}>
        <ThemeSelector />
      </div>
    </>
  );
}

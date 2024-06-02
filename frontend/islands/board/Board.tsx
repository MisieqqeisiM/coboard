import { signal, useContext } from "../../../deps_client.ts";
import { ClientContext } from "../app/WithClient.tsx";
import Canvas, { SignalCanvas } from "./Canvas.tsx";
import CursorBox from "./CursorBox.tsx";
import MouseTracker from "./MouseTracker.tsx";
import Loading from "../../components/Loading.tsx";
import { Camera, CameraContext } from "../../../client/camera.ts";
import AlreadyLoggedIn from "../../components/AlreadyLoggedIn.tsx";
import Toolbar from "./Toolbar.tsx";
import ThemeSelector from "../app/ThemeSelector.tsx";
import { SettingsContext } from "../../../client/settings.ts";
import Controls from "./Controls.tsx";
import CameraView from "./CameraView.tsx";

export default function Board() {
  const width = 2048;
  const height = 2048;

  const client = useContext(ClientContext);
  const settings = useContext(SettingsContext);

  if (!client) return <Loading />;
  if (!client.allowed) return <AlreadyLoggedIn />;
  if (client.ui.viewerOnly) settings.stylusMode.value = true;

  const camera = signal(
    new Camera(
      globalThis.window.innerWidth / 2 - width / 2,
      globalThis.window.innerHeight / 2 - height / 2,
      1,
    ),
  );

  const controls = new SignalCanvas();

  return (
    <>
      <CameraContext.Provider value={camera}>
        <Canvas
          controls={controls}
        />
        <CameraView>
          <CursorBox />
          <MouseTracker client={client} />
        </CameraView>
      </CameraContext.Provider>
      <Controls
        camera={camera}
        controls={controls}
      >
      </Controls>
      <Toolbar />
      <div style={{ position: "absolute", zIndex: 101, right: 10, top: 10 }}>
        <ThemeSelector />
      </div>
    </>
  );
}

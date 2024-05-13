import { signal, useContext } from "../../../deps_client.ts";
import { ClientContext } from "../app/WithClient.tsx";
import DrawableCanvas from "./DrawableCanvas.tsx";
import ObservableCanvas from "./ObservableCanvas.tsx";
import CursorBox from "./CursorBox.tsx";
import MouseTracker from "./MouseTracker.tsx";
import Loading from "../../components/Loading.tsx";
import { Camera } from "../../../client/camera.ts";
import CameraView from "./CameraView.tsx";
import AlreadyLoggedIn from "../../components/AlreadyLoggedIn.tsx";
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
        <div class="board" style={{ position:'absolute', height:"100%", width:"100%"}}>
           <ObservableCanvas client={client} width={width} height={height} />
            <CameraView camera={camera}>
            <DrawableCanvas client={client} width={width} height={height} />
          </CameraView>
        </div>
        <CursorBox />
        <MouseTracker client={client} />
      <Toolbar />
    </>
  );
}

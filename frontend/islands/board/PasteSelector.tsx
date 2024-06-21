import { Camera, CameraContext } from "../../../client/camera.ts";
import { Client } from "../../../client/client.ts";
import { Mode, Settings, SettingsContext } from "../../../client/settings.ts";
import { showMessage } from "../../../client/toast.ts";
import { useContext } from "../../../deps_client.ts";
import { Point } from "../../../liaison/liaison.ts";
import { Line } from "../../../liaison/liaison.ts";
import IconCircle from "../app/IconCircle.tsx";
import { ClientContext } from "../app/WithClient.tsx";
export async function paste(
  x: number,
  y: number,
  client: Client,
  camera: Camera,
  settings: Settings,
) {
  if (client.ui.viewerOnly) return;
  const text = await navigator.clipboard.readText();
  if (!text.startsWith("coboard:")) return;
  const data = JSON.parse(text.slice(8));
  if (!Array.isArray(data)) return;
  const lines: Line[] = [];
  const middle = { x: 0, y: 0 };
  let n = 0;

  for (const obj of data) {
    const id = obj["id"];
    const width = obj["width"];
    const color = obj["color"];
    const coordinates = obj["coordinates"];
    if (typeof id !== "number") return;
    if (typeof width !== "number") return;
    if (typeof color !== "string") return;
    if (!color.match("#[0-9a-fA-F]{6}")) return;
    if (!Array.isArray(coordinates)) return;
    const newCoords: Point[] = [];
    for (const point of coordinates) {
      const x = point["x"];
      const y = point["y"];
      if (typeof x != "number") return;
      if (typeof y != "number") return;
      newCoords.push({ x, y });
      n++;
      middle.x += x;
      middle.y += y;
    }
    lines.push(new Line(id, width, color, newCoords));
  }

  middle.x /= n;
  middle.y /= n;

  client.socket.deselectAll();

  const [mx, my] = camera.toBoardCoords(
    x,
    y,
  );
  const diff = {
    x: mx - middle.x,
    y: my - middle.y,
  };
  const newLines = lines.map((l) => Line.move(l, diff));
  client.socket.drawToSelection(newLines);
  settings.mode.value = Mode.MOVE;
  showMessage("Lines pasted!");
}

export default function PasteSelector() {
  const client = useContext(ClientContext);
  const camera = useContext(CameraContext);
  const settings = useContext(SettingsContext);

  if (!client) return <></>;
  const pasteTo = async (x: number, y: number) => {
    await paste(x, y, client, camera.peek(), settings);
  };
  return (
    <IconCircle
      iconName="clipboard-outline"
      onClick={() =>
        pasteTo(globalThis.innerWidth / 2, globalThis.innerHeight / 2)}
    />
  );
}

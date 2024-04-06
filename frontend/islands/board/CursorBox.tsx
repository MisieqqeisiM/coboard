import { Cursor } from "../../components/board/Cursor.tsx";
import MouseTracker from "./MouseTracker.tsx";
import { ClientContext } from "../app/WithClient.tsx";
import { useContext } from "preact/hooks";

export default function CursorBox() {
  const client = useContext(ClientContext);
  if (client) {
    return (
      <>
        <div>
          {Array.from(client.ui.users.value.entries()).map(([k, v]) => (
            <Cursor name={v.name} x={v.x} y={v.y} key={k} />
          ))}
        </div>
      </>
    );
  }
  return <>Connecting...</>;
}

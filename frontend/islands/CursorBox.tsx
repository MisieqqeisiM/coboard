import { Cursor } from "../components/Cursor.tsx";
import MouseTracker from "./MouseTracker.tsx";
import { ClientContext } from "./WithClient.tsx";

export default function CursorBox() {
  return (
    <ClientContext.Consumer>
      {client => {
        if(!client) return "Connecting...";
        return <>
          <div>
            {Array.from(client.ui.users.value.entries()).map(
              ([k, v]) => <Cursor name={k} x={v.x} y={v.y} key={k} />
            )}
          </div>
          <MouseTracker client={client} />
        </>
      }}
    </ClientContext.Consumer>
  );
}

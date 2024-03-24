import { Cursor } from "../components/Cursor.tsx";
import { ClientContext } from "../islands/WithClient.tsx"
import { useEffect, useRef } from "preact/hooks";
import MouseTracker from "./MouseTracker.tsx";

export default function CursorBox() {
  useEffect(() => {
    let x = 0;
    let y = 0;
    globalThis.addEventListener("mousemove", (e) => {
      x = e.clientX;
      y = e.clientY;
    });
    setInterval(() => {

    }, 200);
  });
  return (
    <ClientContext.Consumer>
      {client => {
        if(client) {
          const container = useRef<HTMLDivElement>(null);
          return (<>
            <div ref={container}>
              {Array.from(client.users.value.entries()).map(
                ([k, v]) => <Cursor name={k} x={v.x} y={v.y} key={k} />
              )}
            </div>
            <MouseTracker client={client} />
          </>);
        } else return "Connecting...";
      }}
    </ClientContext.Consumer>
  );
}
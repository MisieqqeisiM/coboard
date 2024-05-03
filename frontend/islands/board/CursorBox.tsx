import { Cursor } from "../../components/board/Cursor.tsx";
import { ClientContext } from "../app/WithClient.tsx";
import { useContext } from "../../../deps_client.ts";

export default function CursorBox() {
  const client = useContext(ClientContext);
  if (client) {
    return (
      <>
        <div>
          {Array.from(client.ui.users.value.entries()).map(([k, v]) => {
            if (client.account.id == v.account.id) {
              return <></>;
            }
            return <Cursor name={v.account.name} x={v.x} y={v.y} key={k} />;
          })}
        </div>
      </>
    );
  }
  return <>Connecting...</>;
}

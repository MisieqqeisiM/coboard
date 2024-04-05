import { useContext } from "preact/hooks";
import { ClientContext } from "../app/WithClient.tsx";

export default function ClientList() {
  const client = useContext(ClientContext);
  if (client) {
    return (
      <ul>
        {" "}
        {Array.from(client.ui.users.value.values()).map((u) => (
          <li key={u.id}>
            {u.name} <b>{u.pings}</b>
          </li>
        ))}
      </ul>
    );
  }
  return <>Connecting...</>;
}

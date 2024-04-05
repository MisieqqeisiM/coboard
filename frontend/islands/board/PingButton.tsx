import { useContext } from "preact/hooks";
import { ClientContext } from "../app/WithClient.tsx";

export default function PingButton() {
  const client = useContext(ClientContext);
  if (client) {
    return <button onClick={() => client.socket.ping()}> Ping </button>;
  }
  return <>Connecting...</>;
}

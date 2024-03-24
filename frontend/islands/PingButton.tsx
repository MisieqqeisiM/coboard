
import { ClientContext } from "../islands/WithClient.tsx"

export default function PingButton() {
  return (
    <ClientContext.Consumer>
      {client => {
        if(client) return <button onClick={() => client.ping()}> Ping </button>;
        else return "Connecting...";
      }}
    </ClientContext.Consumer>
  );
}
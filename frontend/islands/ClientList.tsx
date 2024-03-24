import { ClientContext } from "../islands/WithClient.tsx"

export default function ClientList() {
  return (
    <ClientContext.Consumer>
      {client => {
        if(client) return (<ul> {
          Array.from(client.users.value.entries()).map(([k, v]) => (<li>{k} <b>{v}</b></li>))
        }</ul>);
        else return "Connecting...";
      }}
    </ClientContext.Consumer>
  );
}
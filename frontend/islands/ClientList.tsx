import { ClientContext } from "../islands/WithClient.tsx"

export default function ClientList() {
  return (
    <ClientContext.Consumer>
      {client => {
        if(client) return (<ul> {
          Array.from(client.users.value.values()).map(u => (<li key={u.id}>{u.id} <b>{u.pings}</b></li>))
        }</ul>);
        else return "Connecting...";
      }}
    </ClientContext.Consumer>
  );
}
import { useEffect, useState } from "preact/hooks";
import { ComponentChildren } from "preact";
import { createContext } from "preact";

import { createClient } from "../../liaison/client.ts"
import { Client, SocketClient } from "../../client/client.ts";
import { UIClient } from "../../client/client.ts";
import { signal } from "@preact/signals";


export const ClientContext = createContext<Client | null>(null);

interface WithClientProps {
  children: ComponentChildren
}

export function WithClient( { children }: WithClientProps ) {
  const [client, setClient] = useState<Client | null> (null);
  useEffect(() => {
    if(client) { return () => { client.socket.disconnect() } }
    const io = createClient();
    const uiClient = new UIClient(signal(new Map()));
    const socketClient = new SocketClient(io, uiClient);
    io.on("connect", () => {
      setClient(new Client(socketClient, uiClient));
    })
    io.connect();
  });

  return (
    <ClientContext.Provider value={client}>
      { children }
    </ClientContext.Provider>
  );
}


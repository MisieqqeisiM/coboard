import { useEffect, useState } from "preact/hooks";
import { ComponentChildren, Context } from "preact";

import { createClient } from "../../../liaison/client.ts";
import { Client, SocketClient } from "../../../client/client.ts";
import { UIClient } from "../../../client/client.ts";
import { signal } from "@preact/signals";
import { createContext } from "preact";

export const ClientContext = createContext<Client | undefined>(undefined); //Dummy value, as we will always return the ClientContext from WithClient

interface WithClientProps {
  children: ComponentChildren;
}

export function WithClient({ children }: WithClientProps) {
  const [client, setClient] = useState<Client | undefined>(undefined);
  useEffect(() => {
    if (client) {
      return () => {
        client.socket.disconnect();
      };
    }
    const io = createClient();
    const uiClient = new UIClient(signal(new Map()));
    const socketClient = new SocketClient(io, uiClient);
    io.on("connect", () => {
      setClient(new Client(socketClient, uiClient));
    });
    io.connect();
  }, []);

  return (
    <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
  );
}

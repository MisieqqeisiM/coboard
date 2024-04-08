import { useEffect, useState } from "preact/hooks";
import { ComponentChildren, Context } from "preact";

import { createClient } from "../../../liaison/client.ts";
import { Client, SocketClient } from "../../../client/client.ts";
import { UIClient } from "../../../client/client.ts";
import { signal } from "@preact/signals";
import { createContext } from "preact";
import { PropertySignature } from "https://deno.land/x/ts_morph@20.0.0/ts_morph.js";

export const ClientContext = createContext<Client | undefined>(undefined); //Dummy value, as we will always return the ClientContext from WithClient

interface WithClientProps {
  myId: string;
  children: ComponentChildren;
}

export function WithClient({ children, myId }: WithClientProps) {
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
      setClient(new Client(socketClient, uiClient, myId));
    });
    io.connect();
  }, []);

  return (
    <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
  );
}

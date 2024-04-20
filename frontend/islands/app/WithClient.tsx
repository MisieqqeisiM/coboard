import { useEffect, useState } from "preact/hooks";
import { ComponentChildren } from "preact";
import { createClient } from "../../../liaison/client.ts";
import { Client, SocketClient } from "../../../client/client.ts";
import { UIClient } from "../../../client/client.ts";
import { signal } from "@preact/signals";
import { createContext } from "preact";
import { Account, ALREADY_LOGGED_IN } from "../../../liaison/liaison.ts";

export const ClientContext = createContext<Client | undefined>(undefined); //Dummy value, as we will always return the ClientContext from WithClient

interface WithClientProps {
  account: Account;
  boardID: string;
  children: ComponentChildren;
}

export function WithClient({ children, account, boardID }: WithClientProps) {
  const [client, setClient] = useState<Client | undefined>(undefined);
  useEffect(() => {
    if (client) {
      return () => {
        client.socket.disconnect();
      };
    }
    const io = createClient(boardID);
    const uiClient = new UIClient(signal(new Map()));
    const socketClient = new SocketClient(io, uiClient);
    io.on("connect", () => {
      setClient(new Client(socketClient, uiClient, account, true));
    });
    io.on("connect_error", (e) => {
      if (e.message == ALREADY_LOGGED_IN) {
        setClient(new Client(socketClient, uiClient, account, false));
      } else {
        globalThis.window.location.href = "/";
      }
    });
    io.connect();
  }, []);

  return (
    <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
  );
}

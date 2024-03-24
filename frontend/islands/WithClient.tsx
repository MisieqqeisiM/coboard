import { useEffect, useState } from "preact/hooks";
import { ComponentChildren } from "preact";
import { createContext } from "preact";

import { Client, connectClient } from "../../liaison/liaison.ts"

class ClientContainer {
  public client?: Client;
}

export const ClientContext = createContext<ClientContainer>(new ClientContainer());

interface WithClientProps {
  children: ComponentChildren
}

export function WithClient( { children }: WithClientProps ) {
  const [container, setContainer] = useState(new ClientContainer());
  useEffect(() => {
    if(container.client)
      return () => {
        container.client?.disconnect();
      }

    connectClient(new class extends Client {
      userList = (users: string[]) => {
        console.log(users);
      }; 
      onConnect(): void {
        setContainer({ client: this });
      }
    });
  });

  return (
    <ClientContext.Provider value={container}>
      { children }
    </ClientContext.Provider>
  );
}


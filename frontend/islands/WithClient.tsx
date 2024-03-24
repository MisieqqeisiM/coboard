import { useEffect, useState } from "preact/hooks";
import { ComponentChildren } from "preact";
import { createContext } from "preact";

import { Client, connectClient } from "../../liaison/liaison.ts"
import { signal } from "@preact/signals";

class ClientContainer {
  public client?: Client;
}

export const ClientContext = createContext<Client | null>(null);

interface WithClientProps {
  children: ComponentChildren
}

export function WithClient( { children }: WithClientProps ) {
  const [client, setClient] = useState<Client | null> (null);
  useEffect(() => {
    if(client)
      return () => {
        client?.disconnect();
      }
    
    
    connectClient(new class extends Client {
      onPing = (user: string) => {
        this.users.value.set(user, (this.users.value.get(user) ?? 0) + 1);
        this.users.value = new Map(this.users.value);
      }
      userList = (users: string[]) => {
        const newUsers = new Map<string, number>();
        for(const u of users)
          newUsers.set(u, this.users.value.get(u) ?? 0);
        this.users.value = newUsers;
      }; 
      onConnect(): void {
        setClient(this);
      }
    });
  });

  return (
    <ClientContext.Provider value={client}>
      { children }
    </ClientContext.Provider>
  );
}


import { useEffect, useState } from "preact/hooks";
import { ComponentChildren } from "preact";
import { createContext } from "preact";

import { Client, connectClient, User } from "../../liaison/liaison.ts"
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
        const u = this.users.value.get(user)!;
        u.pings++;
        this.users.value = new Map(this.users.value);
      }
      onMove = (user: string, x: number, y: number) => {
        const u = this.users.value.get(user)!;
        u.x = x;
        u.y = y;
        this.users.value = new Map(this.users.value);
      }
      userList = (users: User[]) => {
        console.log(users);
        const newUsers = new Map<string, User>();
        for(const u of users)
          newUsers.set(u.id, u);
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


export interface ClientListener {
  onDisconnect(): void;
}

export class ClientData {
  constructor(readonly id: string) {}
}

interface ServerToClientEvents {
  userList: (users: Array<string>) => void;
}

interface ClientToServerEvents { }

interface InterServerEvents { }

interface SocketData { }

export class Server {
  private clients: Array<string> = [];

  public getClients(): Array<string> {
    return this.clients;
  }

  public newClient(data: ClientData): ClientListener {
    const that = this;
    const listener: ClientListener = {
      onDisconnect() {
        that.clients.splice(that.clients.indexOf(data.id), 1);
      }
    };

    this.clients.push(data.id);

    return listener;
  }
}

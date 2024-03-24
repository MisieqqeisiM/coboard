export interface ClientListener {
  onDisconnect(): void;
}

export class ClientData {
  constructor(readonly id: string) {}
}




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

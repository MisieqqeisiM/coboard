import { User } from "../liaison/liaison.ts";
import { ServerSocket, SocketServer } from "../liaison/server.ts";

interface Client {
  user: User;
  socket: ServerSocket;
}

function initUser(id: string, name: string): User {
  return {
    id,
    name,
    x: 0,
    y: 0,
    pings: 0,
  };
}

export class Server {
  private clients: Array<Client> = [];

  constructor(io: SocketServer) {
    io.on("connection", socket => {
      const client: Client =  {
        user: initUser(socket.id, socket.id),
        socket,
      }
      this.clients.push(client);
      this.updateUsers();
      
      socket.on("disconnect", () => {
        this.clients.splice(this.clients.indexOf(client), 1);
        this.updateUsers();
      });

      socket.on("ping", () => {
        client.user.pings++;
        for(const c of this.clients)
          c.socket.emit("onPing", socket.id);
      });

      socket.on("move", (x: number, y: number) => {
        client.user.x = x;
        client.user.y = y;
        for(const c of this.clients)
          c.socket.emit("onMove", socket.id, client.user.x, client.user.y);
      });
    });
  }

  private updateUsers(): void {
    for(const c of this.clients)
      c.socket.emit("userList", this.clients.map(c => c.user));
  }
}

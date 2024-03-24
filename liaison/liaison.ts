import { Server as ServerLogic } from "../server/server.ts"


import { Server, Socket as ServerSocket } from "$socketio/mod.ts"
import { Socket } from "$socketio_client/"
import { io } from "$socketio_client/";
import { Signal, signal } from "@preact/signals";


interface ServerToClientEvents {
  userList(users: Array<string>): void;
  onPing(user: string): void;
}

interface ClientToServerEvents {
  ping: () => void;
}

export function createServer(): ServerLogic {

  const logic = new ServerLogic();

  const io = new Server<ClientToServerEvents, ServerToClientEvents, {} , {}> ({
    cors: {
      origin: "http://localhost:8000"
    }
  });

  const clients: Array<ServerSocket<ClientToServerEvents, ServerToClientEvents, {}, {}>> = [];
  io.on("connection", socket => {
    clients.push(socket);
    for(const c of clients)
      c.emit("userList", clients.map(s => s.id));
    
    socket.on("disconnect", () => {
      clients.splice(clients.indexOf(socket), 1);
      for(const c of clients)
        c.emit("userList", clients.map(s => s.id));
    });

    socket.on("ping", () => {
      for(const c of clients)
        c.emit("onPing", socket.id);
    });

  });

  const handler = io.handler();
  Deno.serve({ port: 3000 }, (req, info) => handler(req, {
    localAddr: { transport: "tcp", hostname: "localhost", port: 3000 },
    remoteAddr: info.remoteAddr
  }));

  return logic;
}


export abstract class Client implements ServerToClientEvents {
  abstract userList: (users: string[]) => void;
  abstract onPing(user: string): void;
  abstract onConnect(): void;

  public users: Signal<Map<string, number>> = signal(new Map());

  public ping(): void {
    this.socket?.emit("ping");
  }

  public disconnect(): void {
    this.socket?.disconnect();
  };

  socket?: Socket<ServerToClientEvents, ClientToServerEvents>;
}

export function connectClient(client: Client) {
  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = 
    io(`${window.location.hostname}:3000/`, { transports: ["websocket"] });

  socket.on("connect", () => {
    client.onConnect();
  });

  socket.on("userList", client.userList);
  socket.on("onPing", client.onPing);
  client.socket = socket;
}
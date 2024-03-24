import { Server as ServerLogic } from "../server/server.ts"


import { Server, Socket as ServerSocket } from "$socketio/mod.ts"
import { Socket } from "$socketio_client/"
import { io } from "$socketio_client/";
import { Signal, signal } from "@preact/signals";

export interface User {
  id: string;
  name: string;
  x: number;
  y: number;
  pings: number;
}

interface ServerClient {
  user: User;
  socket: ServerSocket<ClientToServerEvents, ServerToClientEvents, {}, User>;
}

interface ServerToClientEvents {
  userList(users: Array<User>): void;
  onPing(user: string): void;
  onMove(user: string, x: number, y: number): void;
}

interface ClientToServerEvents {
  ping(): void;
  move(x: number, y: number): void;
}

export function createServer(): ServerLogic {

  const logic = new ServerLogic();

  const io = new Server<ClientToServerEvents, ServerToClientEvents, {} , User> ({
    cors: {
      origin: "http://localhost:8000"
    }
  });

  const clients: Array<ServerClient> = [];
  io.on("connection", socket => {
    const client: ServerClient =  {
      user: {
        id: socket.id,
        name: socket.id,
        x: 0,
        y: 0,
        pings: 0,
      },
      socket
    }
    clients.push(client);
    for(const c of clients)
      c.socket.emit("userList", clients.map(c => c.user));
    
    socket.on("disconnect", () => {
      clients.splice(clients.indexOf(client), 1);
      for(const c of clients)
        c.socket.emit("userList", clients.map(s => s.user));
    });

    socket.on("ping", () => {
      client.user.pings++;
      for(const c of clients)
        c.socket.emit("onPing", socket.id);
    });

    socket.on("move", (x: number, y: number) => {
      client.user.x = x;
      client.user.y = y;
      for(const c of clients)
        c.socket.emit("onMove", socket.id, client.user.x, client.user.y);
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
  abstract onMove(user: string, x: number, y: number): void;
  abstract userList(users: User[]): void;
  abstract onPing(user: string): void;
  abstract onConnect(): void;

  public users: Signal<Map<string, User>> = signal(new Map());

  public ping(): void {
    this.socket?.emit("ping");
  }

  public move(x: number, y: number) {
    this.socket?.emit("move", x, y);
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
  socket.on("onMove", client.onMove);
  client.socket = socket;
}
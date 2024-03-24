import { Server as ServerLogic } from "../server/server.ts"


import { Server, Socket as ServerSocket } from "$socketio/mod.ts"
import { Socket } from "$socketio_client/"
import { io } from "$socketio_client/";


interface ServerToClientEvents {
  userList: (users: Array<string>) => void;
}

export function createServer(): ServerLogic {

  const logic = new ServerLogic();

  const io = new Server<{}, ServerToClientEvents, {} , {}> ({
    cors: {
      origin: "http://localhost:8000"
    }
  });

  const clients: Array<ServerSocket<{}, ServerToClientEvents, {}, {}>> = [];
  io.on("connection", socket => {
    clients.push(socket);
    for(const c of clients)
      c.emit("userList", clients.map(s => s.id));
    
    socket.on("disconnect", () => {
      clients.splice(clients.indexOf(socket), 1);
      for(const c of clients)
        c.emit("userList", clients.map(s => s.id));
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
  abstract onConnect(): void;

  public disconnect(): void {
    this.socket?.disconnect();
  };

  socket?: Socket;
}

export function connectClient(client: Client) {
  const socket: Socket<ServerToClientEvents, {}> = 
    io(`${window.location.hostname}:3000/`, { transports: ["websocket"] });

  socket.on("connect", () => {
    client.onConnect();
  });

  socket.on("userList", client.userList);
  client.socket = socket;
}
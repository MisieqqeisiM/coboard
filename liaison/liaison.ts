import { Server as ServerLogic } from "../server/server.ts"


import { Server } from "$socketio/mod.ts"
import { Socket } from "$socketio_client/"
import { io } from "$socketio_client/";

export function createServer(): ServerLogic {

  const logic = new ServerLogic();

  const io = new Server({
    cors: {
      origin: "http://localhost:8000"
    }
  });

  io.on("connection", socket => {
    const client = logic.newClient({id: socket.id});
    
    socket.on("disconnect", () => {
      client.onDisconnect();
    })

  });

  const handler = io.handler();
  Deno.serve({ port: 3000 }, (req, info) => handler(req, {
    localAddr: { transport: "tcp", hostname: "localhost", port: 3000 },
    remoteAddr: info.remoteAddr
  }));

  return logic;
}


export abstract class Client {
  abstract onConnect(): void;

  public disconnect(): void {
    this.socket?.disconnect();
  };

  socket?: Socket;
}

export function connectClient(client: Client) {
  const socket = io(`${window.location.hostname}:3000/`, { transports: ["websocket"] });

  socket.on("connect", () => {
    client.onConnect();
  });

  client.socket = socket;
}
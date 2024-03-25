import { Server, Socket } from "$socketio/mod.ts";
import { Server as ServerLogic } from "../server/server.ts"
import { ClientToServerEvents, ServerToClientEvents } from "./liaison.ts";

export type SocketServer = Server<ClientToServerEvents, ServerToClientEvents, {} , {}>;
export type ServerSocket = Socket<ClientToServerEvents, ServerToClientEvents, {} , {}>;

export function createServer(): ServerLogic {
  const io: SocketServer = new Server ({
    cors: {
      origin: "http://localhost:8000"
    }
  });
  const server = new ServerLogic(io);
  const handler = io.handler();
  Deno.serve({ port: 3000 }, (req, info) => handler(req, {
    localAddr: { transport: "tcp", hostname: "localhost", port: 3000 },
    remoteAddr: info.remoteAddr
  }));
  return server;
}

export const server = createServer();
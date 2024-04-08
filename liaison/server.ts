import { Server, Socket } from "$socketio/mod.ts";
import { cert, key } from "../certificates/certificates.ts";
import { Server as ServerLogic } from "../server/server.ts";
import { ClientToServerEvents, ServerToClientEvents } from "./liaison.ts";
import { User } from "./liaison.ts"

export interface SocketData {
  client: Client;
};

export interface Client {
  user: User;
  socket: ServerSocket;
}

export type SocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>;

export type ServerSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  {}
>;

export function createServer(): ServerLogic {
  const io: SocketServer = new Server({});
  const server = new ServerLogic(io);
  const handler = io.handler();

  Deno.serve({ port: 8000 }, (req, _) => {
    const redirectURL = new URL(req.url);
    redirectURL.protocol = "https:";
    redirectURL.port = "443";
    return Response.redirect(redirectURL, 301);
  });

  Deno.serve(
    { port: 3690, cert: cert(), key: key() } as Deno.ServeTlsOptions,
    (req, info) =>
      handler(req, {
        localAddr: { transport: "tcp", hostname: "localhost", port: 3690 },
        remoteAddr: info.remoteAddr,
      })
  );
  return server;
}

export const server = createServer();

import { Server, Socket } from "$socketio/mod.ts";
import { cert, key } from "../certificates/certificates.ts";
import { INNER_SOCKET_PORT, INNER_HTTP_PORT, OUTER_HTTPS_PORT } from "../config.ts";
import { Server as ServerLogic } from "../server/server.ts";
import { Account } from "./liaison.ts";
import { ClientToServerEvents, ServerToClientEvents } from "./liaison.ts";

export interface SocketData {
  client: Client;
};

export interface Client {
  account: Account;
  socket: ServerSocket;
}

export type SocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string | number | symbol, never>,
  SocketData
>;

export type ServerSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string | number | symbol, never>,
  SocketData
>;

export function createServer(): ServerLogic {
  const io: SocketServer = new Server({});
  const server = new ServerLogic(io);
  const handler = io.handler();

  Deno.serve({ port: INNER_HTTP_PORT }, (req, _) => {
    const redirectURL = new URL(req.url);
    redirectURL.protocol = "https:";
    redirectURL.port = `${OUTER_HTTPS_PORT}`;
    return Response.redirect(redirectURL, 301);
  });

  Deno.serve(
    { port: INNER_SOCKET_PORT, cert: cert(), key: key() } as Deno.ServeTlsOptions,
    (req, info) =>
      handler(req, {
        localAddr: { transport: "tcp", hostname: "localhost", port: INNER_SOCKET_PORT },
        remoteAddr: info.remoteAddr,
      })
  );
  return server;
}

export const server = createServer();

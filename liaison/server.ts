import { Server, Socket } from "$socketio/mod.ts";
import { DATABASE_URL, SOCKET_PORT } from "../config.ts";
import { Board } from "../server/board.ts";
import { Server as ServerLogic } from "../server/server.ts";
import { Account } from "./liaison.ts";
import { ClientToServerEvents, ServerToClientEvents } from "./liaison.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.33.0/mod.ts";
import { sleep } from "https://deno.land/x/sleep/mod.ts"

export interface SocketData {
  client: Client;
}

export interface Client {
  account: Account;
  socket: ServerSocket;
  board: Board;
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

export async function createServer(): Promise<ServerLogic> {
  const io: SocketServer = new Server({
    pingTimeout: 5000,
    pingInterval: 5000,
  });

  const mongoClient = new MongoClient();
  while (true) {
    console.log("connecting to database...")
    try {
      await mongoClient.connect(DATABASE_URL);
      break;
    } catch {
      await sleep(3);
    }
  }
  const server = new ServerLogic(io, mongoClient);
  const handler = io.handler();

  Deno.serve(
    { port: SOCKET_PORT },
    (req, info) =>
      handler(req, {
        localAddr: {
          transport: "tcp",
          hostname: "localhost",
          port: SOCKET_PORT,
        },
        remoteAddr: info.remoteAddr,
      })
  );
  return server;
}

export const server = await createServer();

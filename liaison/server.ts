import { MongoClient, Server, ServerSocket as Socket, sleep } from "../deps.ts";
import { CONNECTION_TIMEOUT } from "../config.ts";
import { Board } from "../server/board.ts";
import { Server as ServerLogic } from "../server/server.ts";
import { Account } from "./liaison.ts";
import { ClientToServerEvents } from "./liaison.ts";
import {
  BoardEvent,
  BoardEventVisitor,
  ConfirmLineEvent,
  OnDrawEvent,
  OnMoveEvent,
  OnRemoveEvent,
  OnResetEvent,
  UserListEvent,
} from "../liaison/events.ts";
import { DATABASE_URL, SOCKET_PORT } from "../config.ts";

export interface SocketData {
  client: Client;
}

export class ClientStore {
  private clients: Map<string, Client> = new Map();

  public addClient(c: Client) {
    this.clients.set(c.account.id, c);
    setTimeout(() => {
      if (!c.hasSocket()) {
        c.disconnect();
      }
    }, CONNECTION_TIMEOUT);
  }

  public removeClient(c: Client) {
    this.clients.delete(c.account.id);
  }

  public getClient(id: string) {
    return this.clients.get(id);
  }

  public emit(event: BoardEvent) {
    for (const client of this.clients.values()) {
      client.emit(event);
    }
  }
}

class Emitter implements BoardEventVisitor {
  constructor(readonly socket: ServerSocket) {}

  public onDraw(event: OnDrawEvent) {
    this.socket.emit("onDraw", event);
  }
  public onRemove(event: OnRemoveEvent): void {
    this.socket.emit("onRemove", event);
    
  }

  public onMove(event: OnMoveEvent) {
    this.socket.emit("onMove", event);
  }

  public onReset(event: OnResetEvent) {
    this.socket.emit("onReset", event);
  }

  public userList(event: UserListEvent) {
    this.socket.emit("userList", event);
  }

  public confirmLine(event: ConfirmLineEvent) {
    this.socket.emit("confirmLine", event);
  }
}

export class Client {
  private emitter?: Emitter;
  private cachedEvents: BoardEvent[] = [];

  constructor(
    readonly account: Account,
    readonly board: Board,
  ) {}

  public hasSocket(): boolean {
    return this.emitter !== undefined;
  }

  public setSocket(socket: ServerSocket) {
    socket.on("disconnect", () => this.board.disconnect(this));
    socket.on("draw", async (line) => await this.board.draw(this, line));
    socket.on("remove", async(lineId)=>await this.board.remove(this, lineId));
    socket.on("move", (x, y) => this.board.move(this, x, y));
    socket.on("reset", async () => await this.board.reset(this));

    this.emitter = new Emitter(socket);
    for (const e of this.cachedEvents) {
      e.accept(this.emitter);
    }
    this.cachedEvents = []; // free up RAM
  }

  public disconnect() {
    this.emitter?.socket.disconnect();
    this.board.disconnect(this);
  }

  public emit(event: BoardEvent) {
    if (this.emitter) {
      event.accept(this.emitter);
    } else {
      this.cachedEvents.push(event);
    }
  }
}

export type SocketServer = Server<
  ClientToServerEvents,
  BoardEventVisitor,
  Record<string | number | symbol, never>,
  SocketData
>;

export type ServerSocket = Socket<
  ClientToServerEvents,
  BoardEventVisitor,
  Record<string | number | symbol, never>,
  SocketData
>;

export async function createServer(): Promise<ServerLogic> {
  const io: SocketServer = new Server({
    pingTimeout: 5000,
    pingInterval: 5000,
  });

  const mongoClient = new MongoClient(DATABASE_URL);
  while (true) {
    console.log("connecting to database...");
    try {
      await mongoClient.connect();
      break;
    } catch {
      await sleep(3);
    }
  }
  const server = new ServerLogic(io, mongoClient);
  await server.boards.init();
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
      }),
  );
  return server;
}

export const server = await createServer();

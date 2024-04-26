import { Socket, io } from "$socketio_client/";
import { ClientToServerEvents } from "./liaison.ts";
import { getCookies } from "$std/http/cookie.ts"
import { OUTER_SOCKET_PORT } from "../config.ts";
import { BoardEventVisitor } from "./events.ts";
import { Line, BoardUser } from "./liaison.ts"

export type ClientSocket = Socket<BoardEventVisitor, ClientToServerEvents>;

export class ClientState {
  constructor(
    readonly lines: Line[],
    readonly users: BoardUser[],
  ) { }
}

export function createClient(board: string): ClientSocket {
  const headers = new Headers();
  headers.set("Cookie", globalThis.document.cookie);
  const token = getCookies(headers)["auth"];
  return io(`${window.location.hostname}:${OUTER_SOCKET_PORT}/`, {
    auth: {
      token,
      board,
    },
    transports: ["websocket"],
    autoConnect: false,
    secure: true,
    rejectUnauthorized: false,
  });
}

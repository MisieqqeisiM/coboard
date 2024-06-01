import { ClientSocket as Socket, getCookies, io } from "../deps_client.ts";
import { BoardActionVisitor } from "./actions.ts";
import { BoardEventVisitor } from "./events.ts";
import { BoardUser, Line } from "./liaison.ts";

export type ClientSocket = Socket<BoardEventVisitor, BoardActionVisitor>;

export class ClientState {
  constructor(
    readonly lines: Line[],
    readonly users: BoardUser[],
    readonly shareToken: string,
    readonly viewerOnly: boolean
  ) {}
}

export function createClient(board: string): ClientSocket {
  const headers = new Headers();
  headers.set("Cookie", globalThis.document.cookie);
  const token = getCookies(headers)["auth"];
  return io(window.location.host, {
    auth: {
      token,
      board,
    },
    transports: ["websocket"],
    autoConnect: false,
  });
}

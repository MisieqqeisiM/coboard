import { Socket, io } from "$socketio_client/";
import { ClientToServerEvents, ServerToClientEvents } from "./liaison.ts";
import { getCookies } from "$std/http/cookie.ts"

export type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

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
    secure: true,
    rejectUnauthorized: false,
  });
}

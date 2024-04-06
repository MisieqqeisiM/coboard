import { Socket, io } from "$socketio_client/";
import { ClientToServerEvents, ServerToClientEvents } from "./liaison.ts";
import { getCookies } from "$std/http/cookie.ts"

export type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function createClient(): ClientSocket {
  const headers = new Headers();
  headers.set("Cookie", globalThis.document.cookie);
  const token = getCookies(headers)["auth"];
  return io(`${window.location.hostname}:3690/`, {
    auth: {
      token
    },
    transports: ["websocket"],
    autoConnect: false,
    secure: true,
    rejectUnauthorized: false,
  });
}

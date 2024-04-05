import { Socket, io } from "$socketio_client/";
import { ClientToServerEvents, ServerToClientEvents } from "./liaison.ts";

export type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function createClient(): ClientSocket {
  return io(`${window.location.hostname}:3690/`, {
    transports: ["websocket"],
    autoConnect: false,
    secure: true,
    rejectUnauthorized: false,
  });
}

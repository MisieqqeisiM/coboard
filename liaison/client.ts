import { Socket, io } from "$socketio_client/";
import { ClientToServerEvents, ServerToClientEvents } from "./liaison.ts";

export type ClientSocket =  Socket<ServerToClientEvents, ClientToServerEvents>;

export function createClient(): ClientSocket {
  return io(`${window.location.hostname}:3000/`, { transports: ["websocket"], autoConnect: false});
}
export interface User {
  id: string;
  name: string;
  x: number;
  y: number;
  pings: number;
}

export interface ServerToClientEvents {
  userList(users: Array<User>): void;
  onPing(user: string): void;
  onMove(user: string, x: number, y: number): void;
  onAuthenticate(token: string): void;
}

export interface ClientToServerEvents {
  ping(): void;
  move(x: number, y: number): void;
  authenticate(username: string, password: string): void;
}

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
  onDraw(user: string, start_x: number, start_y: number, end_x: number, end_y:number): void;
}

export interface ClientToServerEvents {
  ping(): void;
  move(x: number, y: number): void;
  draw(start_x: number, start_y: number, end_x: number, end_y: number): void;
}



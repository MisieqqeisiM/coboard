export interface Account {
  id: string;
  name: string;
}

export interface BoardUser {
  account: Account;
  x: number;
  y: number;
}

export interface ServerToClientEvents {
  userList(users: Array<BoardUser>): void;
  onMove(user: string, x: number, y: number): void;
  onDraw(user: string, points: { x: number, y: number }[]): void;
  onReset(): void;
}

export interface ClientToServerEvents {
  move(x: number, y: number): void;
  draw(points: { x: number, y: number }[]): void;
  reset(): void;
}

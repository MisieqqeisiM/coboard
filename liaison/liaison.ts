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
  onDraw(user: string, line: Line): void;
  onReset(): void;
}

export interface ClientToServerEvents {
  move(x: number, y: number): void;
  draw(points: { x: number, y: number }[]): void;
  reset(): void;
}

export const ALREADY_LOGGED_IN = "already logged in";
export const BAD_TOKEN = "bad token";


export class StrokeStyle {
  constructor (
    readonly width: number = 3,
    readonly color: string = "black"
  ) {}
}

export class Line {
  constructor (
    readonly width: number, 
    readonly color: string, 
    readonly coordinates: {x: number, y: number}[]) {}
}
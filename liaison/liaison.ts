export interface Account {
  id: string;
  name: string;
}

export interface BoardUser {
  account: Account;
  x: number;
  y: number;
}

export interface ClientToServerEvents {
  move(x: number, y: number): void;
  draw(line: Line): void;
  reset(): void;
}

export const ALREADY_LOGGED_IN = "already logged in";
export const BAD_TOKEN = "bad token";


export class Line {
  constructor(
    readonly width: number,
    readonly color: string,
    readonly coordinates: { x: number, y: number }[]
  ) { }
}
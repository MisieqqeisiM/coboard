export interface Account {
  id: string;
  name: string;
  boards: string[];
}

export interface BoardUser {
  account: Account;
  x: number;
  y: number;
}

export interface ClientToServerEvents {
  move(x: number, y: number): void;
  draw(line: Line): void;
  remove(id: number): void;
  reset(): void;
}

export interface Point {
  x: number;
  y: number;
}

export const ALREADY_LOGGED_IN = "already logged in";
export const BAD_TOKEN = "bad token";

export class Line {
  constructor(
    readonly id: number,
    readonly width: number,
    readonly color: string,
    readonly coordinates: Point[],
  ) {}
  static changeId(line: Line, newId: number): Line {
    return new Line(newId, line.width, line.color, line.coordinates);
  }
}

export interface User {
  id: string;
  name: string;
  x: number;
  y: number;
  newStrokes: { x: number, y: number }[][]; //strokes to draw - this will be a stack, should be a queue
  pings: number;
}

export interface ServerToClientEvents {
  userList(users: Array<User>): void;
  onPing(user: string): void;
  onMove(user: string, x: number, y: number): void;
  onDraw(user: string, points: { x: number, y: number }[]): void;
  onAuthenticate(token: string): void;
}

export interface ClientToServerEvents {
  ping(): void;
  move(x: number, y: number): void;
  draw(points: { x: number, y: number }[]): void;
  reset(): void;
}

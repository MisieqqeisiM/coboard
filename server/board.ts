import { Client, SocketServer } from "../liaison/server.ts";
import { BoardUser } from "../liaison/liaison.ts";

export class Board {
  private room = crypto.randomUUID();
  private users: Map<string, BoardUser> = new Map();
  private strokes: { x: number, y: number }[][] = [];

  constructor(private io: SocketServer) { }

  public hasUser(id: string) {
    return this.users.has(id);
  }

  public newUser(client: Client) {
    const user: BoardUser = {
      account: client.account,
      x: 0,
      y: 0,
    };

    client.socket.on("reset", () => {
      this.strokes = [];
      this.io.to(this.room).emit("onReset");
    });

    client.socket.on("disconnect", () => {
      this.users.delete(user.account.id);
      this.updateUsers();
    });

    client.socket.on("move", (x: number, y: number) => {
      user.x = x;
      user.y = y;
      this.io.to(this.room).emit("onMove", user.account.id, user.x, user.y);
    });

    client.socket.on("draw", (points: { x: number, y: number }[]) => {
      this.strokes.push(points);
      this.io.to(this.room).emit("onDraw", user.account.id, points);
    });

    client.socket.join(this.room);
    this.users.set(user.account.id, user);

    this.updateUsers();
    for (const stroke of this.strokes)
      client.socket.emit("onDraw", null!, stroke);
  }

  private updateUsers(): void {
    this.io.to(this.room).emit("userList", Array.from(this.users.values()));
  }
}

import { Signal } from "@preact/signals";
import { ClientSocket } from "../liaison/client.ts";
import { Account, BoardUser, ClientToServerEvents } from "../liaison/liaison.ts";

export class Client {
  constructor(readonly socket: SocketClient, readonly ui: UIClient, readonly account: Account) { }
}

export class UIClient {
  constructor(readonly users: Signal<Map<string, BoardUser>>,
    readonly strokes: Signal<{ x: number, y: number }[][]> = new Signal([]),
    readonly clear: Signal<boolean> = new Signal(false)) { }
}

export class SocketClient implements ClientToServerEvents {
  constructor(private io: ClientSocket, private client: UIClient) {
    io.on("onMove", (id, x, y) => {
      const user = client.users.value.get(id)!;
      user.x = x;
      user.y = y;
      client.users.value = new Map(client.users.value);
    });

    io.on("userList", (users) => {
      const newUsers = new Map<string, BoardUser>();
      for (const user of users) newUsers.set(user.account.id, user);
      client.users.value = newUsers;
    });

    io.on("onDraw", (_id, points: { x: number, y: number }[]) => {
      client.strokes.value = [...client.strokes.value, points];
    });

    io.on("onReset", () => {
      client.strokes.value = [];
      client.clear.value = true;
    });

    io.on("connect_error", () => {
      globalThis.window.location.href = "/";
    });
  }

  public move(x: number, y: number) {
    this.io.emit("move", x, y);
  }

  public draw(points: { x: number, y: number }[]) {
    this.io.emit("draw", points);
  }

  public reset() {
    this.io.emit("reset");
  }

  public disconnect(): void {
    this.io.disconnect();
  }
}

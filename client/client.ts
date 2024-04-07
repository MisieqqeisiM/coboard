import { Signal } from "@preact/signals";
import { ClientSocket } from "../liaison/client.ts";
import { User, ClientToServerEvents } from "../liaison/liaison.ts";

export class Client {
  constructor(readonly socket: SocketClient, readonly ui: UIClient, readonly myId: string) { }
}

export class UIClient {
  constructor(readonly users: Signal<Map<string, User>>,
    readonly strokes: Signal<{ x: number, y: number }[][]> = new Signal([])) { }
}

export class SocketClient implements ClientToServerEvents {
  constructor(private io: ClientSocket, private client: UIClient) {
    io.on("onPing", (id) => {
      const user = client.users.value.get(id)!;
      user.pings++;
      client.users.value = new Map(client.users.value);
    });

    io.on("onMove", (id, x, y) => {
      const user = client.users.value.get(id)!;
      user.x = x;
      user.y = y;
      client.users.value = new Map(client.users.value);
    });

    io.on("userList", (users) => {
      const newUsers = new Map<string, User>();
      for (const user of users) newUsers.set(user.id, user);
      client.users.value = newUsers;
    });

    io.on("onDraw", (id, points: { x: number, y: number }[]) => {
      client.strokes.value = [...client.strokes.value, points];
    });

    io.on("onAuthenticate", (tokenName: string) => {
      sessionStorage.setItem("token", tokenName);
    });
  }

  public ping() {
    this.io.emit("ping");
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

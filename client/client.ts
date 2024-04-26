import { Signal } from "@preact/signals";
import { ClientSocket } from "../liaison/client.ts";
import { Account, BoardUser, ClientToServerEvents } from "../liaison/liaison.ts";
import { Line } from "../liaison/liaison.ts"
import { ClientState } from "../liaison/client.ts";

export class Client {
  constructor(
    readonly socket: SocketClient,
    readonly ui: UIClient,
    readonly account: Account,
    readonly allowed: boolean
  ) { }
}


export class UIClient {
  constructor(readonly users: Signal<Map<string, BoardUser>>,
    readonly strokes: Signal<Line[]> = new Signal([]),
    readonly local_strokes: Signal<Line[]> = new Signal([]),
    readonly clear: Signal<boolean> = new Signal(false),
  ) { }
}

export class SocketClient implements ClientToServerEvents {
  constructor(private io: ClientSocket, client: UIClient, state: ClientState) {
    client.strokes.value = state.lines;
    const newUsers = new Map<string, BoardUser>();
    for (const user of state.users) newUsers.set(user.account.id, user);
    client.users.value = newUsers;

    io.on("onMove", (e) => {
      const user = client.users.value.get(e.user)!;
      user.x = e.x;
      user.y = e.y;
      client.users.value = new Map(client.users.value);
    });

    io.on("userList", (e) => {
      const newUsers = new Map<string, BoardUser>();
      for (const user of e.users) newUsers.set(user.account.id, user);
      client.users.value = newUsers;
    });

    io.on("onDraw", (e) => {
      client.strokes.value = [...client.strokes.value, e.line];
    });

    io.on("confirmLine", (_e) => {
      client.local_strokes.value = [...client.local_strokes.value.slice(1)];
    });

    io.on("onReset", (_e) => {
      client.strokes.value = [];
      client.clear.value = true;
    });

  }

  public move(x: number, y: number) {
    this.io.emit("move", x, y);
  }

  public draw(points: Line) {
    this.io.emit("draw", points);
  }

  public reset() {
    this.io.emit("reset");
  }

  public disconnect(): void {
    this.io.disconnect();
  }
}

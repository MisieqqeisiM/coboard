import { Signal, signal } from "../deps_client.ts";
import { ClientSocket, ClientState } from "../liaison/client.ts";
import {
  Account,
  BoardUser,
  ClientToServerEvents,
  Line,
} from "../liaison/liaison.ts";

export class Client {
  constructor(
    readonly socket: SocketClient,
    readonly ui: UIClient,
    readonly account: Account,
    readonly allowed: boolean,
  ) {}
}

export class UIClient {
  readonly users: Signal<Map<string, BoardUser>> = signal(new Map());
  public lines: Map<number, Line> = new Map();
  readonly local_strokes: Signal<Line[]> = signal([]);
  readonly clear: Signal<boolean> = signal(false);
  readonly newLine: Signal<Line | null> = signal(null);
  readonly removeLine: Signal<number | null> = signal(null);

  constructor(initialState: ClientState) {
    for (const line of initialState.lines) {
      this.lines.set(line.id!, line);
    }
    const newUsers = new Map<string, BoardUser>();
    for (const user of initialState.users) newUsers.set(user.account.id, user);
    this.users.value = newUsers;
  }
}

export class SocketClient implements ClientToServerEvents {
  constructor(private io: ClientSocket, client: UIClient) {
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
      client.lines.set(e.line.id!, e.line);
      client.newLine.value = e.line;
    });

    io.on("onRemove", (e) => {
      client.lines.delete(e.lineId!);
      client.removeLine.value = e.lineId;
    });

    io.on("confirmLine", (_e) => {
      client.local_strokes.value = [...client.local_strokes.value.slice(1)];
    });

    io.on("onReset", (_e) => {
      client.lines = new Map();
      client.clear.value = true;
    });
  }

  public move(x: number, y: number) {
    this.io.emit("move", x, y);
  }

  public draw(points: Line) {
    this.io.emit("draw", points);
  }
  public remove(id: number) {
    this.io.emit("remove", id);
  }

  public reset() {
    this.io.emit("reset");
  }

  public disconnect(): void {
    this.io.disconnect();
  }
}

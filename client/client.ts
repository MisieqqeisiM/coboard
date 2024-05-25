import { createLazyClient } from "$socketio/vendor/deno.land/x/redis@v0.27.1/redis.ts";
import { Signal, signal } from "../deps_client.ts";
import { linesIntersect } from "../frontend/islands/board/webgl-utils/line_drawing.ts";
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

interface Confirmation {
  localId: number;
  globalId: number;
}

export class UIClient {
  readonly users: Signal<Map<string, BoardUser>> = signal(new Map());
  public lines: Map<number, Line> = new Map();
  readonly localIds: number[] = [];
  readonly clear: Signal<boolean> = signal(false);
  readonly newLine: Signal<Line | null> = signal(null);
  readonly removeLine: Signal<number | null> = signal(null);
  readonly confirmLine: Signal<Confirmation | null> = signal(null);

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
  constructor(private io: ClientSocket, private client: UIClient) {
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

    io.on("confirmLine", (e) => {
      const id = client.localIds.shift()!;
      const line = client.lines.get(id);
      if (!line) return;
      client.lines.delete(id);
      client.lines.set(e.lineId, Line.changeId(line, e.lineId));

      client.confirmLine.value = {
        localId: id,
        globalId: e.lineId,
      };
    });

    io.on("onReset", (_e) => {
      client.lines = new Map();
      client.clear.value = true;
    });
  }

  public move(x: number, y: number) {
    this.io.emit("move", x, y);
  }

  public draw(line: Line) {
    this.client.localIds.push(line.id!);
    this.client.lines.set(line.id!, line);
    this.io.emit("draw", line);
  }
  public remove(id: number) {
    this.client.lines.delete(id);
    this.io.emit("remove", id);
  }

  public reset() {
    this.io.emit("reset");
  }

  public disconnect(): void {
    this.io.disconnect();
  }
}

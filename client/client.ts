import { Signal, signal } from "../deps_client.ts";
import {
  BoardActionVisitor,
  DrawAction,
  MoveAction,
  RemoveAction,
  ResetAction,
  Undoable,
} from "../liaison/actions.ts";
import { ClientSocket, ClientState } from "../liaison/client.ts";
import { Account, BoardUser, Line } from "../liaison/liaison.ts";

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

class Emitter implements BoardActionVisitor {
  constructor(private io: ClientSocket) {}
  public move(action: MoveAction): void {
    this.io.emit("move", action);
  }
  public draw(action: DrawAction): void {
    this.io.emit("draw", action);
  }
  public remove(action: RemoveAction): void {
    this.io.emit("remove", action);
  }
  public reset(action: ResetAction): void {
    this.io.emit("reset", action);
  }
  public disconnect() {
    this.io.disconnect();
  }
}

export class SocketClient {
  private actionStack: Undoable[] = [];
  private emitter: Emitter;
  constructor(io: ClientSocket, private client: UIClient) {
    this.emitter = new Emitter(io);
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

  public undo() {
    const action = this.actionStack.pop();
    action?.undo().accept(this.emitter);
  }

  public move(x: number, y: number) {
    (new MoveAction(x, y)).accept(this.emitter);
  }

  public draw(line: Line) {
    this.client.localIds.push(line.id!);
    this.client.lines.set(line.id!, line);
    const action = new DrawAction(line);
    action.accept(this.emitter);
    this.actionStack.push(action);
  }

  public remove(id: number) {
    const line = this.client.lines.get(id);
    if (!line) return;
    this.client.lines.delete(id);
    const action = new RemoveAction(line);
    action.accept(this.emitter);
    this.actionStack.push(action);
  }

  public reset() {
    (new ResetAction()).accept(this.emitter);
  }

  public disconnect(): void {
    this.emitter.disconnect();
  }
}

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
import { LineCache } from "./LineCache.ts";
import { ObservableCanvas } from "./canvas.ts";

export class Client {
  constructor(
    readonly socket: SocketClient,
    readonly ui: UIClient,
    readonly account: Account,
    readonly allowed: boolean,
  ) {}
}

export class SignalCanvas implements ObservableCanvas {
  public readonly onAddLine = new Signal<Line | null>(null);
  public readonly onRemoveLine = new Signal<number | null>(null);
  public readonly onReset = new Signal<boolean>(false);

  addLine(line: Line): void {
    this.onAddLine.value = line;
  }

  removeLine(id: number): void {
    this.onRemoveLine.value = id;
  }

  reset(): void {
    this.onReset.value = true;
  }
}

export class UIClient {
  readonly users: Signal<Map<string, BoardUser>> = signal(new Map());
  readonly clear: Signal<boolean> = signal(false);
  readonly shareToken: string;
  readonly viewerOnly: boolean;
  readonly canvas = new SignalCanvas();
  readonly cache: LineCache;

  constructor(initialState: ClientState) {
    this.cache = new LineCache(initialState.lines, this.canvas);
    this.shareToken = initialState.shareToken;
    this.viewerOnly = initialState.viewerOnly;
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
  private actionStack: Undoable[][] = [];
  private currentAction: Undoable[] = [];
  private inAction: boolean = false;
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

    io.on("onDraw", (e) => client.cache.addRemoteLine(e.line));
    io.on("onRemove", (e) => client.cache.removeLine(e.lineId));
    io.on("confirmLine", (e) => client.cache.confirmLine(e.lineId));
    io.on("onReset", (_) => client.cache.reset());
  }

  public beginAction() {
    this.inAction = true;
  }

  public endAction() {
    this.inAction = false;
    this.actionStack.push(this.currentAction);
    this.currentAction = [];
  }

  public undo() {
    const action = this.actionStack.pop();
    if(!action) return;
    for(const move of action.toReversed())
      move?.undo().accept(this.emitter);
  }

  public move(x: number, y: number) {
    new MoveAction(x, y).accept(this.emitter);
  }

  public draw(line: Line) {
    const newLine = this.client.cache.addLocalLine(line);
    const action = new DrawAction(newLine);
    action.accept(this.emitter);
    this.currentAction.push(action);
    if(!this.inAction) this.endAction();
  }

  public remove(id: number) {
    const line = this.client.cache.removeLine(id);
    if (!line) return;
    const action = new RemoveAction(line);
    action.accept(this.emitter);
    this.currentAction.push(action);
    if(!this.inAction) this.endAction();
  }

  public reset() {
    new ResetAction().accept(this.emitter);
  }

  public disconnect(): void {
    this.emitter.disconnect();
  }
}

import { Signal, signal } from "../deps_client.ts";
import {
  BoardActionVisitor,
  DeselectAction,
  DrawAction,
  MoveAction,
  MoveSelectionAction,
  RemoveAction,
  RemoveSelectionAction,
  ResetAction,
  SelectAction,
  Undoable,
} from "../liaison/actions.ts";
import { ClientSocket, ClientState } from "../liaison/client.ts";
import { Account, BoardUser, Line, Point } from "../liaison/liaison.ts";
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
  public readonly onAddLines = new Signal<Line[]>([]);
  public readonly onRemoveLines = new Signal<number[]>([]);
  public readonly onReset = new Signal<boolean>(false);

  addLines(lines: Line[]): void {
    this.onAddLines.value = lines;
  }
  removeLines(ids: number[]): void {
    this.onRemoveLines.value = ids;
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
  public select(action: SelectAction): void {
    this.io.emit("select", action);
  }
  public deselect(action: DeselectAction): void {
    this.io.emit("deselect", action);
  }
  public removeSelection(action: RemoveSelectionAction): void {
    this.io.emit("removeSelection", action);
  }
  public moveSelection(action: MoveSelectionAction): void {
    this.io.emit("moveSelection", action);
  }
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

    io.on("onDraw", (e) => client.cache.addRemoteLines(e.lines));
    io.on("onRemove", (e) => client.cache.removeLines(e.lineIds));
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
    if (!action) return;
    for (const move of action.toReversed()) {
      move?.undo().accept(this.emitter);
    }
  }

  public move(x: number, y: number) {
    new MoveAction(x, y).accept(this.emitter);
  }

  public moveSelection(vec: Point) {
    new MoveSelectionAction(vec).accept(this.emitter);
  }

  public removeSelection() {
    new RemoveSelectionAction().accept(this.emitter);
  }

  public draw(line: Line) {
    console.log(line);
    const newLine = this.client.cache.addLocalLines([line]);
    const action = new DrawAction(newLine[0]);
    action.accept(this.emitter);
    this.currentAction.push(action);
    if (!this.inAction) this.endAction();
  }

  public select(ids: number[]) {
    const action = new SelectAction(ids);
    action.accept(this.emitter);
  }

  public deselect(ids: number[]) {
    const action = new DeselectAction(ids);
    action.accept(this.emitter);
  }

  public remove(id: number) {
    const lines = this.client.cache.removeLines([id]);
    if (lines.length == 0) return;
    const action = new RemoveAction(lines[0]);
    action.accept(this.emitter);
    this.currentAction.push(action);
    if (!this.inAction) this.endAction();
  }

  public reset() {
    new ResetAction().accept(this.emitter);
  }

  public disconnect(): void {
    this.emitter.disconnect();
  }
}

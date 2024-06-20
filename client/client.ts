import { updateCheck } from "$fresh/src/dev/update_check.ts";
import { Signal, signal } from "../deps_client.ts";
import {
  BoardActionVisitor,
  DrawAction,
  MoveAction,
  RemoveAction,
  ResetAction,
  Undoable,
  UpdateAction,
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
  readonly selection: Signal<Map<number, Line>> = signal(new Map());
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
  public update(action: UpdateAction): void {
    this.io.emit("update", action);
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
  private actions: Undoable[] = [];
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

    io.on("onDraw", (e) => client.cache.addRemoteLines([e.line]));
    io.on("onRemove", (e) => client.cache.removeLines([e.lineId]));
    io.on("onUpdate", (e) => {
      client.cache.removeLines(e.remove);
      client.cache.addRemoteLines(e.create);
    });
    io.on("confirmLine", (e) => client.cache.confirmLines([e.lineId]));
    io.on("confirmLines", (e) => client.cache.confirmLines(e.lineIds));
    io.on("onReset", (_) => client.cache.reset());
  }

  public beginAction() {
    this.inAction = true;
  }

  public undo() {
    const action = this.actions.pop();
    if (!action) return;
    action.undo().accept(this.emitter);
  }

  public move(x: number, y: number) {
    new MoveAction(x, y).accept(this.emitter);
  }

  public draw(line: Line) {
    const newLine = this.client.cache.addLocalLine(line);
    const action = new DrawAction(newLine);
    this.actions.push(action);
    action.accept(this.emitter);
  }

  public remove(id: number) {
    const lines = this.client.cache.removeLines([id]);
    if (lines.length == 0) return;
    const action = new RemoveAction(lines[0]);
    this.actions.push(action);
    action.accept(this.emitter);
  }

  public select(lines: Line[]) {
    const newSelection = new Map(this.client.selection.peek());
    for (const line of lines) {
      newSelection.set(line.id, line);
    }
    this.client.selection.value = newSelection;
    this.client.canvas.removeLines(lines.map((line) => line.id));
  }

  public deleteSelection() {
    this.update(Array.from(this.client.selection.peek().keys()), []);
    this.client.selection.value = new Map();
  }

  public drawToSelection(lines: Line[]) {
    const newLines: Line[] = [];
    for (const line of lines) {
      newLines.push(Line.changeId(line, this.client.cache.getUniqueId()));
    }
    this.select(newLines);
  }

  public deselectAll() {
    this.deselect(Array.from(this.client.selection.peek().values()));
  }

  public update(remove: number[], create: Line[]): Line[] {
    const removedLines = this.client.cache.removeLines(remove);
    const newLines = this.client.cache.addLocalLines(create);
    const action = new UpdateAction(removedLines, newLines);
    action.accept(this.emitter);
    this.actions.push(action);
    return newLines;
  }

  public deselect(lines: Line[]) {
    this.update(lines.map((line) => line.id), lines);
    const newSelection = new Map(this.client.selection.peek());
    for (const line of lines) {
      newSelection.delete(line.id);
    }
    this.client.selection.value = newSelection;
  }

  public reset() {
    new ResetAction().accept(this.emitter);
  }

  public disconnect(): void {
    this.emitter.disconnect();
  }
}

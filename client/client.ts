import { Signal, signal } from "../deps_client.ts";
import {
  BoardActionVisitor,
  DrawAction,
  MoveAction,
  RemoveAction,
  ResetAction,
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

  public addLines(lines: Line[]): void {
    this.onAddLines.value = lines;
  }

  public removeLines(ids: number[]): void {
    this.onRemoveLines.value = ids;
  }

  public reset(): void {
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

interface Action {
  added: Line[];
  removed: Line[];
}

export class SocketClient {
  private undoStack: Action[] = [];
  private redoStack: Action[] = [];
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

  private changeActionId(action: Action, oldId: number, newId: number): Action {
    const added = action.added.map((line) => {
      if (line.id !== oldId && this.client.cache.globalId(line.id) !== oldId) {
        return line;
      }
      return Line.changeId(line, newId);
    });
    const removed = action.removed.map((line) => {
      if (line.id !== oldId && this.client.cache.globalId(line.id) !== oldId) {
        return line;
      }
      return Line.changeId(line, newId);
    });
    return { added, removed };
  }

  private changeStackId(oldId: number, newId: number) {
    this.undoStack = this.undoStack.map((action) => {
      return this.changeActionId(action, oldId, newId);
    });
    this.redoStack = this.redoStack.map((action) => {
      return this.changeActionId(action, oldId, newId);
    });
  }

  public undo() {
    const action = this.undoStack.pop();
    if (!action) return;
    this.client.cache.removeLines(action.added.map((l) => l.id));
    const newLines = this.client.cache.addLocalLines(action.removed);
    for (let i = 0; i < newLines.length; i++) {
      this.changeStackId(action.removed[i].id, newLines[i].id);
    }
    new UpdateAction(action.added, newLines).accept(this.emitter);
    this.redoStack.push({ added: newLines, removed: action.added });
  }

  public redo() {
    const action = this.redoStack.pop();
    if (!action) return;
    this.client.cache.removeLines(action.added.map((l) => l.id));
    const newLines = this.client.cache.addLocalLines(action.removed);
    for (let i = 0; i < newLines.length; i++) {
      this.changeStackId(action.removed[i].id, newLines[i].id);
    }
    new UpdateAction(action.added, newLines).accept(this.emitter);
    this.undoStack.push({ added: newLines, removed: action.added });
  }

  public move(x: number, y: number) {
    new MoveAction(x, y).accept(this.emitter);
  }

  public draw(line: Line) {
    const newLine = this.client.cache.addLocalLine(line);
    const action = new DrawAction(newLine);
    this.undoStack.push({ removed: [], added: [newLine] });
    this.redoStack = [];
    action.accept(this.emitter);
  }

  public remove(id: number) {
    const lines = this.client.cache.removeLines([id]);
    if (lines.length == 0) return;
    const action = new RemoveAction(lines[0]);
    this.undoStack.push({ removed: [lines[0]], added: [] });
    this.redoStack = [];
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
    if (remove.length == 0 && create.length == 0) return [];
    const removedLines = this.client.cache.removeLines(remove);
    const newLines = this.client.cache.addLocalLines(create);
    const action = new UpdateAction(removedLines, newLines);
    action.accept(this.emitter);
    this.undoStack.push({ removed: removedLines, added: newLines });
    this.redoStack = [];
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

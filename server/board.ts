import { Client } from "../liaison/server.ts";
import { BoardUser, Line, Point } from "../liaison/liaison.ts";
import { ClientStore } from "../liaison/server.ts";
import {
  ConfirmLineEvent,
  OnDrawEvent,
  OnMoveEvent,
  OnRemoveEvent,
  OnResetEvent,
  UserListEvent,
} from "../liaison/events.ts";
import { ClientState } from "../liaison/client.ts";
import { MongoClient } from "../deps.ts";
import { toPathString } from "https://deno.land/std@0.216.0/fs/_to_path_string.ts";
import { createLazyClient } from "$socketio/vendor/deno.land/x/redis@v0.27.1/redis.ts";

export interface BoardDB {
  id: string;
  name: string;
  shareToken: string;
  lines: Line[];
  userIDs: string[];
}

interface ServerLine {
  line: Line;
  selectedBy: Set<string>;
}

export interface BoardUnloader {
  unload(id: string): void;
}

export class Board {
  private users: Map<string, BoardUser> = new Map();
  private clients: ClientStore = new ClientStore();
  private lines: Map<number, ServerLine> = new Map();

  //temporary
  private lineId: number = 0;

  constructor(
    private mongoClient: MongoClient,
    private id: string,
    private unloader: BoardUnloader,
  ) {}

  public async init() {
    const boards = this.mongoClient.db("main").collection<BoardDB>("boards");
    const board = await boards.findOne({ id: this.id });
    for (const line of board!.lines) {
      this.lines.set(line.id, { line, selectedBy: new Set() });
      this.lineId = Math.max(this.lineId, line.id);
    }
  }

  public getUser(id: string) {
    return this.clients.getClient(id);
  }

  public hasUser(id: string) {
    return this.users.has(id);
  }

  public async newUser(client: Client): Promise<ClientState> {
    const user: BoardUser = {
      account: client.account,
      x: 0,
      y: 0,
    };

    this.users.set(user.account.id, user);
    this.clients.addClient(client);
    this.updateUsers();

    // const lines = Array.from(this.lines.values()).map((l) => l.line);
    const boards = this.mongoClient.db("main").collection<BoardDB>("boards");
    const board = await boards.findOne({ id: this.id });
    return new ClientState(
      board!.lines,
      Array.from(this.users.values()),
      board!.shareToken,
      client.viewerOnly,
    );
  }

  public disconnect(client: Client) {
    this.users.delete(client.account.id);
    this.clients.removeClient(client);
    for (const line of this.lines.values()) {
      line.selectedBy.delete(client.account.id);
    }
    this.updateUsers();
    if (this.users.size === 0) {
      this.unloader.unload(this.id);
    }
  }

  public async reset(_client: Client) {
    const boards = this.mongoClient.db("main").collection<BoardDB>("boards");
    await boards.updateOne({ id: this.id }, { $set: { lines: [] } });
    this.clients.emit(new OnResetEvent());
  }

  public move(client: Client, x: number, y: number) {
    const user = this.users.get(client.account.id)!;
    user.x = x;
    user.y = y;
    this.clients.emit(new OnMoveEvent(client.account.id, x, y));
  }

  public select(client: Client, id: number) {
    this.lines.get(id)?.selectedBy.add(client.account.id);
  }

  public deselect(client: Client, id: number) {
    this.lines.get(id)?.selectedBy.delete(client.account.id);
  }

  public async moveLines(client: Client, ids: number[], vec: Point) {
    const newLines: Line[] = [];
    const toRemove: number[] = [];
    for (const id of ids) {
      const line = this.lines.get(id);
      if (!line) continue;
      line.selectedBy.delete(client.account.id);
      if (line.selectedBy.size == 0) {
        toRemove.push(id);
      }
      const newLine = Line.changeId(Line.move(line.line, vec), ++this.lineId);
      newLines.push(newLine);
      this.lines.set(newLine.id, { line: newLine, selectedBy: new Set() });
    }

    const boards = this.mongoClient.db("main").collection<BoardDB>("boards");
    await boards.updateOne(
      { id: this.id },
      {
        $pull: { lines: { id: { $in: toRemove } } },
      },
    );
    await boards.updateOne(
      { id: this.id },
      {
        $push: { lines: { $each: newLines } },
      },
    );
    this.clients.emit(new OnDrawEvent(client.account.id, newLines));
    this.clients.emit(new OnRemoveEvent(toRemove));
  }

  public async removeLines(client: Client, ids: number[]) {
    const toRemove: number[] = [];
    for (const id of ids) {
      const line = this.lines.get(id);
      if (!line) continue;
      line.selectedBy.delete(client.account.id);
      if (line.selectedBy.size == 0) {
        toRemove.push(id);
      }
    }

    const boards = this.mongoClient.db("main").collection<BoardDB>("boards");
    await boards.updateOne(
      { id: this.id },
      {
        $pull: { lines: { id: { $in: toRemove } } },
      },
    );
    this.clients.emit(new OnRemoveEvent(toRemove));
  }

  public async draw(client: Client, line: Line): Promise<number> {
    const boards = this.mongoClient.db("main").collection<BoardDB>("boards");
    const id = ++this.lineId;
    const confirmedLine = Line.changeId(line, id);
    this.lines.set(id, { line: confirmedLine, selectedBy: new Set() });
    await boards.updateOne(
      { id: this.id },
      {
        $push: { lines: confirmedLine },
      },
    );
    this.clients.emit(new OnDrawEvent(client.account.id, [confirmedLine]));
    client.emit(new ConfirmLineEvent(id));
    return id;
  }
  public async remove(_: Client, lineId: number) {
    const boards = this.mongoClient.db("main").collection<BoardDB>("boards");
    //TODO: here actually remove the line
    await boards.updateOne(
      { id: this.id },
      {
        $pull: { lines: { id: lineId } },
      },
    );
    this.clients.emit(new OnRemoveEvent([lineId]));
  }

  private updateUsers(): void {
    this.clients.emit(new UserListEvent(Array.from(this.users.values())));
  }
}

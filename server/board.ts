import { Client } from "../liaison/server.ts";
import { BoardUser, Line } from "../liaison/liaison.ts";
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

export interface BoardDB {
  id: string;
  name: string;
  lines: Line[];
  userIDs: string[];
}

export interface BoardUnloader {
  unload(id: string): void;
}

export class Board {
  private users: Map<string, BoardUser> = new Map();
  private clients: ClientStore = new ClientStore();

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
    this.lineId = board?.lines.at(-1)?.id ?? 0;
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

    const boards = this.mongoClient.db("main").collection<BoardDB>("boards");
    const board = await boards.findOne({ id: this.id });
    return new ClientState(board!.lines, Array.from(this.users.values()));
  }

  public disconnect(client: Client) {
    this.users.delete(client.account.id);
    this.clients.removeClient(client);
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

  public async draw(client: Client, line: Line) {
    const boards = this.mongoClient.db("main").collection<BoardDB>("boards");
    const confirmedLine = Line.changeId(line, ++this.lineId);
    await boards.updateOne({ id: this.id }, {
      $push: { lines: confirmedLine },
    });
    this.clients.emit(new OnDrawEvent(client.account.id, confirmedLine));
    client.emit(new ConfirmLineEvent());
  }
  public async remove(client: Client, lineId: number) {
    const boards = this.mongoClient.db("main").collection<BoardDB>("boards");
    //TODO: here actually remove the line
    await boards.updateOne({ id: this.id }, {
      $pull: { lines: { id: lineId } },
    });
    this.clients.emit(new OnRemoveEvent(lineId));
  }

  private updateUsers(): void {
    this.clients.emit(new UserListEvent(Array.from(this.users.values())));
  }
}

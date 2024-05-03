import { Client, SocketServer } from "../liaison/server.ts";
import { BoardUser, Line } from "../liaison/liaison.ts";
import { ClientStore } from "../liaison/server.ts";
import {
  ConfirmLineEvent,
  OnDrawEvent,
  OnMoveEvent,
  OnResetEvent,
  UserListEvent,
} from "../liaison/events.ts";
import { ClientState } from "../liaison/client.ts";

export class Board {
  private users: Map<string, BoardUser> = new Map();
  private clients: ClientStore = new ClientStore();
  private strokes: Line[] = [];

  constructor(private io: SocketServer) {}

  public getUser(id: string) {
    return this.clients.getClient(id);
  }

  public hasUser(id: string) {
    return this.users.has(id);
  }

  public newUser(client: Client): ClientState {
    const user: BoardUser = {
      account: client.account,
      x: 0,
      y: 0,
    };

    this.users.set(user.account.id, user);
    this.clients.addClient(client);
    this.updateUsers();

    return new ClientState(this.strokes, Array.from(this.users.values()));
  }

  public disconnect(client: Client) {
    this.users.delete(client.account.id);
    this.clients.removeClient(client);
    this.updateUsers();
  }

  public reset(_client: Client) {
    this.strokes = [];
    this.clients.emit(new OnResetEvent());
  }

  public move(client: Client, x: number, y: number) {
    const user = this.users.get(client.account.id)!;
    user.x = x;
    user.y = y;
    this.clients.emit(new OnMoveEvent(client.account.id, x, y));
  }

  public draw(client: Client, line: Line) {
    this.strokes.push(line);
    this.clients.emit(new OnDrawEvent(client.account.id, line));
    client.emit(new ConfirmLineEvent());
  }

  private updateUsers(): void {
    this.clients.emit(new UserListEvent(Array.from(this.users.values())));
  }
}

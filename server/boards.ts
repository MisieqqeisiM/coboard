import { nanoid } from "../deps.ts";
import { SocketServer } from "../liaison/server.ts";
import { Board } from "./board.ts";

export class Boards {
  private boards: Map<string, Board> = new Map();
  private userBoards: Map<string, Array<string>> = new Map();

  constructor(private io: SocketServer) {
    this.boards.set("general", new Board(io));
  }

  // deno-lint-ignore require-await
  public async newBoard(): Promise<string> {
    const id = nanoid(10);
    this.boards.set(id, new Board(this.io));
    return id;
  }

  // deno-lint-ignore require-await
  public async getBoard(id: string): Promise<Board | null> {
    return this.boards.get(id) ?? null;
  }

  public async userInBoard(userID: string, boardID: string): Promise<boolean> {
    return (await this.getUserBoards(userID)).indexOf(boardID) != -1;
  }

  public async addUserToBoard(userID: string, boardID: string) {
    const boards = await this.getUserBoards(userID);
    if (!await this.userInBoard(userID, boardID)) {
      boards.push(boardID);
    }
    this.userBoards.set(userID, boards);
  }

  // deno-lint-ignore require-await
  public async getUserBoards(id: string): Promise<Array<string>> {
    return this.userBoards.get(id) ?? ["general"];
  }
}

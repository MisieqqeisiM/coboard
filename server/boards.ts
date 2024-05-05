import { MongoClient, nanoid } from "../deps.ts";
import { Account } from "../liaison/liaison.ts";
import { SocketServer } from "../liaison/server.ts";
import { Board, BoardDB } from "./board.ts";

export class Boards {
  private boards: Map<string, Board> = new Map();

  constructor(private io: SocketServer, private mongoClient: MongoClient) {}

  public async init() {
    const boards = this.mongoClient.db("main").collection<BoardDB>("boards");
    if (await this.getBoard("general")) return;
    await boards.insertOne({ id: "general", lines: [], userIDs: [] });
  }

  public async newBoard(): Promise<string> {
    const boards = this.mongoClient.db("main").collection<BoardDB>("boards");
    const id = nanoid(10);
    await boards.insertOne({
      id,
      lines: [],
      userIDs: [],
    });
    return id;
  }

  public async getBoard(id: string): Promise<Board | null> {
    const boards = this.mongoClient.db("main").collection<BoardDB>("boards");
    let board = this.boards.get(id);
    if (!board) {
      const boardDB = await boards.findOne({ id });
      if (!boardDB) return null;
      board = new Board(this.mongoClient, id);
      this.boards.set(id, board);
    }
    return board;
  }

  public async userInBoard(userID: string, boardID: string): Promise<boolean> {
    if (boardID === "general") return true;
    const accounts = this.mongoClient.db("main").collection<Account>(
      "accounts",
    );
    return await accounts.findOne({
      id: userID,
      boards: { $all: [boardID] },
    }) !== null;
  }

  public async addUserToBoard(userID: string, boardID: string) {
    if (boardID === "general") return;
    const accounts = this.mongoClient.db("main").collection<Account>(
      "accounts",
    );
    await accounts.updateOne({ id: userID }, { $push: { boards: boardID } });
  }

  public async getUserBoards(id: string): Promise<Array<string>> {
    const accounts = this.mongoClient.db("main").collection<Account>(
      "accounts",
    );
    const account = await accounts.findOne({ id });
    account?.boards.unshift("general");
    return account?.boards ?? [];
  }
}

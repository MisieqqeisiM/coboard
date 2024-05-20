import { MongoClient, nanoid } from "../deps.ts";
import { Account } from "../liaison/liaison.ts";
import { SocketServer } from "../liaison/server.ts";
import { Board, BoardDB, BoardUnloader } from "./board.ts";
import { BoardTileProps } from "../frontend/components/BoardTile.tsx";

export class Boards implements BoardUnloader {
  private boards: Map<string, Board> = new Map();

  constructor(private io: SocketServer, private mongoClient: MongoClient) {}

  public async init() {
    const boards = this.mongoClient.db("main").collection<BoardDB>("boards");
    if (await this.getBoard("general")) return;
    await boards.insertOne({
      id: "general",
      name: "general",
      lines: [],
      userIDs: [],
    });
  }

  public unload(id: string) {
    this.boards.delete(id);
  }

  public async newBoard(): Promise<BoardTileProps> {
    const boards = this.mongoClient.db("main").collection<BoardDB>("boards");
    const id = nanoid(10);
    await boards.insertOne({
      id,
      name: "New board",
      lines: [],
      userIDs: [],
    });
    return {
      id: id,
      name: "New board",
    };
  }

  public async getBoard(id: string): Promise<Board | null> {
    const boards = this.mongoClient.db("main").collection<BoardDB>("boards");
    let board = this.boards.get(id);
    if (!board) {
      const boardDB = await boards.findOne({ id });
      if (!boardDB) return null;
      board = new Board(this.mongoClient, id, this);
      this.boards.set(id, board);
    }
    return board;
  }

  public async RenameBoard(boardId: string, newName: string) {
    const boards = this.mongoClient.db("main").collection<BoardDB>("boards");
    await boards.updateOne({ id: boardId }, { $set: { name: newName } });
  }

  public async userInBoard(userID: string, boardID: string): Promise<boolean> {
    if (boardID === "general") return true;
    const accounts = this.mongoClient
      .db("main")
      .collection<Account>("accounts");
    return (
      (await accounts.findOne({
        id: userID,
        boards: { $all: [boardID] },
      })) !== null
    );
  }

  public async addUserToBoard(userID: string, boardID: string) {
    if (boardID === "general") return;
    const accounts = this.mongoClient
      .db("main")
      .collection<Account>("accounts");
    await accounts.updateOne({ id: userID }, { $push: { boards: boardID } });
  }

  public async removeUserFromBoard(userID: string, boardID: string) {
    if (boardID === "general") return;
    const accounts = this.mongoClient
      .db("main")
      .collection<Account>("accounts");
    await accounts.updateOne({ id: userID }, { $pull: { boards: boardID } });
  }

  public async getUserBoards(id: string): Promise<Array<BoardTileProps>> {
    const accounts = this.mongoClient
      .db("main")
      .collection<Account>("accounts");
    const boards = this.mongoClient.db("main").collection<BoardDB>("boards");

    const account = await accounts.findOne({ id });
    account?.boards.unshift("general");

    let result: BoardTileProps[] = [];
    result = await Promise.all(
      account?.boards.map(async (id: string) => {
        const temp = await boards.findOne({ id: id });
        return {
          id: id,
          name: temp!.name != undefined ? temp!.name : id,
        };
      })
    );
    return result;
  }
}

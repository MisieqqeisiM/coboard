import { MongoClient } from "../deps.ts";
import { Client, SocketServer } from "../liaison/server.ts";
import { ClientState } from "../liaison/client.ts";
import { ALREADY_LOGGED_IN, BAD_TOKEN } from "../liaison/liaison.ts";
import { Accounts } from "./accounts.ts";
import { Boards } from "./boards.ts";

export class Server {
  public readonly accounts: Accounts;
  public readonly boards: Boards;

  public async initClient(
    userID: string,
    boardID: string,
  ): Promise<ClientState | null> {
    const board = (await this.boards.getBoard(boardID))!;
    const client = new Client(
      (await this.accounts.getAccountById(userID))!,
      board,
    );
    if (board.hasUser(userID)) return null;
    return board.newUser(client);
  }
  constructor(io: SocketServer, readonly mongoClient: MongoClient) {
    this.mongoClient = mongoClient;
    //get accounts and boards from mongodb in the future or something
    this.accounts = new Accounts(mongoClient);
    this.boards = new Boards(io, mongoClient);

    io.use(async (socket) => {
      const token = socket.handshake.auth["token"] as string;
      if (!token) throw new Error(BAD_TOKEN);
      const boardID = socket.handshake.auth["board"] as string;
      if (!boardID) throw new Error(BAD_TOKEN);
      const account = await this.accounts.getAccount(token);
      if (!account) throw new Error(BAD_TOKEN);

      const board = await this.boards.getBoard(boardID);
      if (!board) throw new Error();

      if (!(await this.boards.userInBoard(account.id, boardID))) {
        throw new Error();
      }

      if (board.getUser(account.id)?.hasSocket()) {
        throw new Error(ALREADY_LOGGED_IN);
      }

      const client = board.getUser(account.id);
      if (!client) {
        throw new Error(BAD_TOKEN);
      }
      socket.data.client = client;
    });

    io.on("connection", (socket) => {
      socket.data.client!.setSocket(socket);
    });
  }
}

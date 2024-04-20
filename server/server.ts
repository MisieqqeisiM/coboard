import { ALREADY_LOGGED_IN, BAD_TOKEN } from "../liaison/liaison.ts";
import { SocketServer } from "../liaison/server.ts";
import { Accounts } from "./accounts.ts"
import { Boards } from "./boards.ts"


export class Server {
  public accounts: Accounts;
  public boards: Boards;

  constructor(io: SocketServer) {
    this.accounts = new Accounts();
    this.boards = new Boards(io);

    io.use(async socket => {
      const token = socket.handshake.auth["token"] as string;
      if (!token) throw new Error(BAD_TOKEN);
      const boardID = socket.handshake.auth["board"] as string;
      if (!boardID) throw new Error(BAD_TOKEN);
      const account = await this.accounts.getAccount(token);
      if (!account) throw new Error(BAD_TOKEN);

      const board = await this.boards.getBoard(boardID);
      if (!board)
        throw new Error();

      if (!await this.boards.userInBoard(account.id, boardID))
        throw new Error();

      if (board.hasUser(account.id)) throw new Error(ALREADY_LOGGED_IN);

      socket.data.client = {
        account,
        socket,
        board,
      };
    });

    io.on("connection", socket => {
      socket.data.client!.board.newUser(socket.data.client!);
    });
  }
}

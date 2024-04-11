import { ALREADY_LOGGED_IN } from "../liaison/liaison.ts";
import { SocketServer } from "../liaison/server.ts";
import { Accounts } from "./accounts.ts"
import { Board } from "./board.ts"


export class Server {
  public accounts: Accounts;

  constructor(io: SocketServer) {
    this.accounts = new Accounts();
    const board = new Board(io);

    io.use(async socket => {
      const token = socket.handshake.auth["token"] as string;
      if (!token) throw new Error(BAD_TOKEN);
      const account = await this.accounts.getAccount(token);
      if (!account) throw new Error(BAD_TOKEN);

      if (board.hasUser(account.id)) throw new Error(ALREADY_LOGGED_IN);

      socket.data.client = {
        account,
        socket,
      };
    });

    io.on("connection", socket => {
      board.newUser(socket.data.client!);
    });
  }
}

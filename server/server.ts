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
      if (!token) throw new Error("bad token");
      const account = await this.accounts.getAccount(token);
      if (!account) throw new Error("bad token");

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

import { FreshContext, Handlers, PageProps } from "../../deps.ts";
import { ClientState } from "../../liaison/client.ts";
import { Account } from "../../liaison/liaison.ts";
import { server } from "../../liaison/server.ts";
import { getAccount } from "../../server/utils.ts";
import AlreadyLoggedIn from "../components/AlreadyLoggedIn.tsx";
import LoginForm from "../islands/app/LoginForm.tsx";
import { WithClient } from "../islands/app/WithClient.tsx";
import Board from "../islands/board/Board.tsx";

export const handler: Handlers = {
  async GET(req: Request, ctx: FreshContext) {
    const boardID = ctx.params["board"];
    const board = await server.boards.getBoard(boardID);
    if (!board) return ctx.renderNotFound();

    const account = await getAccount(req);
    let clientState: ClientState | null = null;

    if (account) {
      await server.boards.addUserToBoard(account.id, boardID);
      clientState = await server.initClient(account.id, boardID);
    }

    return ctx.render({ account, clientState, boardID });
  },
};

interface BoardViewPars {
  account?: Account;
  clientState?: ClientState;
  boardID: string;
}

export default function BoardView(props: PageProps<BoardViewPars>) {
  if (!props.data.account) {
    return <LoginForm redirectTo={`/${props.data.boardID}`} />;
  }
  if (!props.data.clientState) {
    return <AlreadyLoggedIn />;
  }
  return (
    <WithClient
      account={props.data.account}
      boardID={props.data.boardID}
      initialState={props.data.clientState}
    >
      <Board />
    </WithClient>
  );
}

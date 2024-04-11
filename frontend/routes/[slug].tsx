import { FreshContext, Handlers, PageProps } from "$fresh/server.ts";
import { deleteCookie, getCookies } from "$std/http/cookie.ts";
import { Account } from "../../liaison/liaison.ts";
import { server } from "../../liaison/server.ts";
import LoginForm from "../islands/app/LoginForm.tsx";
import { WithClient } from "../islands/app/WithClient.tsx";
import Board from "../islands/board/Board.tsx";

function redirectToHome(): Response {
  const headers = new Headers();
  headers.set("location", "/");
  return new Response(null, {
    status: 303,
    headers,
  });
}

export const handler: Handlers = {
  async GET(req: Request, ctx: FreshContext) {
    const boardID = ctx.url.pathname.substring(1);
    const board = await server.boards.getBoard(boardID);
    if (!board) return ctx.renderNotFound();

    const cookies = getCookies(req.headers);
    const token = cookies["auth"];
    if (!token) return ctx.render({ account: null, boardID });
    const account = await server.accounts.getAccount(token);
    if (!account) return redirectToHome();

    await server.boards.addUserToBoard(account.id, boardID);
    return ctx.render({ account, boardID });
  },
};

interface BoardViewPars {
  account: Account;
  boardID: string;
}

export default function BoardView(props: PageProps<BoardViewPars>) {
  if (!props.data.account) return <LoginForm board={props.data.boardID} />;
  return (
    <WithClient account={props.data.account} boardID={props.data.boardID}>
      <Board />
    </WithClient>
  );
}

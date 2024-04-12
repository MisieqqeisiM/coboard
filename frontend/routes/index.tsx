import { Handlers, PageProps } from "$fresh/server.ts";
import { server } from "../../liaison/server.ts";
import { deleteCookie, getCookies } from "$std/http/cookie.ts";
import LoginForm from "../islands/app/LoginForm.tsx";
import Board from "../islands/board/Board.tsx";
import { WithClient } from "../islands/app/WithClient.tsx";
import { Account } from "../../liaison/liaison.ts";

interface HomePars {
  account: Account | null;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const cookies = getCookies(req.headers);
    const token = cookies["auth"];
    if (!token) return ctx.render!({ currentUserId: null });
    const account = await server.accounts.getAccount(token);
    const res = await ctx.render!({ account });
    if (!account) deleteCookie(res.headers, "auth");
    return res;
  },
};

export default function Home(props: PageProps<HomePars>) {
  if (!props.data.account) {
    return <LoginForm />;
  }
  return (
    <WithClient account={props.data.account}>
      <Board />
    </WithClient>
  );
}

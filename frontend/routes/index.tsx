import { Handlers, PageProps } from "$fresh/server.ts";
import { server } from "../../liaison/server.ts";
import { deleteCookie, getCookies } from "$std/http/cookie.ts";
import LoginForm from "../islands/app/LoginForm.tsx";
import { Account } from "../../liaison/liaison.ts";
import Dashboard from "../components/Dashboard.tsx";

interface HomePars {
  account: Account | null;
  boards: Array<string>;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const cookies = getCookies(req.headers);
    const token = cookies["auth"];
    if (!token) return ctx.render!({ account: null });
    const account = await server.accounts.getAccount(token);
    if (account) {
      const boards = await server.boards.getUserBoards(account?.id);
      return await ctx.render!({ account, boards });
    } else {
      const res = await ctx.render!({ account });
      deleteCookie(res.headers, "auth");
      return res;
    }
  },
};

export default function Home(props: PageProps<HomePars>) {
  if (!props.data.account) {
    return <LoginForm board="" />;
  }
  return <Dashboard boards={props.data.boards} />;
}

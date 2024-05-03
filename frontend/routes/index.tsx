import { Handlers, PageProps } from "$fresh/server.ts";
import { server } from "../../liaison/server.ts";
import LoginForm from "../islands/app/LoginForm.tsx";
import { Account } from "../../liaison/liaison.ts";
import Dashboard from "../components/Dashboard.tsx";
import { getAccount } from "../../server/utils.ts";

interface HomePars {
  account: Account | null;
  boards: Array<string>;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const account = await getAccount(req);
    if (account) {
      const boards = await server.boards.getUserBoards(account.id);
      return await ctx.render!({ account, boards });
    } else {
      const res = await ctx.render!({ account });
      return res;
    }
  },
};

export default function Home(props: PageProps<HomePars>) {
  if (!props.data.account) {
    return <LoginForm redirectTo="/" />;
  }
  return <Dashboard boards={props.data.boards} />;
}

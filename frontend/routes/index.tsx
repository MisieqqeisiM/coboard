import { Handlers, PageProps } from "$fresh/server.ts";
import { server } from "../../liaison/server.ts";
import { deleteCookie, getCookies } from "$std/http/cookie.ts";
import LoginForm from "../islands/app/LoginForm.tsx";
import Board from "../islands/board/Board.tsx";
import { WithClient } from "../islands/app/WithClient.tsx";

interface HomePars {
  currentUserId: string | null;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const cookies = getCookies(req.headers);
    const token = cookies["auth"];
    if (!token) {
      return ctx.render!({ currentUserId: null });
    }
    const id = await server.validate(token);
    const res = await ctx.render!({ currentUserId: id });
    if (!id) {
      deleteCookie(res.headers, "auth");
    }
    return res;
  },
};
export default function Home(props: PageProps<HomePars>) {
  if (!props.data.currentUserId) {
    return <LoginForm />;
  }
  return (
    <WithClient myId={props.data.currentUserId}>
      <Board />
    </WithClient>
  );
}

import { Handlers } from "$fresh/server.ts"
import { getCookies } from "$std/http/cookie.ts"
import { server } from "../../../liaison/server.ts"

function redirectTo(path: string): Response {
  const headers = new Headers();
  headers.set("location", path);
  return new Response(null, {
    status: 303,
    headers,
  });
}

export const handler: Handlers = {
  async GET(req) {
    const cookies = getCookies(req.headers);
    const token = cookies["auth"];
    if (!token) return redirectTo("/");
    const account = await server.accounts.getAccount(token);
    if (!account) return redirectTo("/");

    const board = await server.boards.newBoard();
    await server.boards.addUserToBoard(account.id, board);

    return redirectTo("/");
  }
};
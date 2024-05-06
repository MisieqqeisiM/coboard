import { Handlers } from "../../../deps.ts";
import { server } from "../../../liaison/server.ts";
import { getAccount, redirectToHome } from "../../../server/utils.ts";

export const handler: Handlers = {
  async GET(req) {
    const account = await getAccount(req);
    if (!account) {
      return redirectToHome();
    }

    const url = new URL(req.url);
    const name = url.searchParams.get("name");
    if (name) {
      await server.accounts.setName(account.id, name);
    }
    const redirectTo = url.searchParams.get("redirectTo");
    console.log(redirectTo);
    const headers = new Headers();
    headers.set("location", redirectTo ?? "/");
    return new Response(null, {
      status: 303,
      headers,
    });
  },
};

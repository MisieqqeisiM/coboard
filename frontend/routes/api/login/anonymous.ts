import { Handlers, setCookie } from "../../../../deps.ts";
import { TOKEN_LIFETIME } from "../../../../config.ts";
import { server } from "../../../../liaison/server.ts";

function redirectToHome(): Response {
  const headers = new Headers();
  headers.set("location", "/");
  return new Response(null, {
    status: 303,
    headers,
  });
}

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const id = crypto.randomUUID();
    let location = url.searchParams.get("redirectTo") ?? "/";
    if (!(await server.accounts.getAccountById(id))) {
      location = `/set_name?redirectTo=${location}`;
    }
    await server.accounts.newAccount(id);

    const token = await server.accounts.getToken(id);
    if (!token) return redirectToHome();

    const headers = new Headers();
    setCookie(headers, {
      name: "auth",
      value: token,
      maxAge: TOKEN_LIFETIME,
      sameSite: "Lax",
      domain: url.hostname,
      path: "/",
      secure: true,
    });

    headers.set("location", location);
    return new Response(null, {
      status: 303,
      headers,
    });
  },
};

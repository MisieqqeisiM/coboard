import { Handlers } from "$fresh/server.ts"
import { setCookie } from "$std/http/cookie.ts"
import { TOKEN_LIFETIME } from "../../../config.ts";
import { server } from "../../../liaison/server.ts"

function redirectToHome(): Response {
  const headers = new Headers();
  headers.set("location", "/");
  return new Response(null, {
    status: 303,
    headers,
  });
}

export const handler: Handlers = {
  async POST(req) {
    const url = new URL(req.url);
    const form = await req.formData();
    const login = form.get("login");
    if (!login) return redirectToHome();

    const token = await server.accounts.getToken(login.toString(), "");
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
    headers.set("location", "/");
    return new Response(null, {
      status: 303,
      headers,
    });

  },
};
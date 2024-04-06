import { Handlers } from "$fresh/server.ts"
import { setCookie } from "$std/http/cookie.ts"
import { server } from "../../../liaison/server.ts"

export const handler: Handlers = {
  async POST(req) {
    const url = new URL(req.url);
    const form = await req.formData();
    const login = form.get("login");
    if (!login) {
      return new Response(null, {
        status: 400
      });
    }

    const token = await server.auth(login.toString(), "");

    if (!token) {
      return new Response(null, {
        status: 403
      });
    }

    const headers = new Headers();
    setCookie(headers, {
      name: "auth",
      value: token,
      maxAge: 120,
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
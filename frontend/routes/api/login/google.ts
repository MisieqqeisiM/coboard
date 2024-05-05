import { Handlers, setCookie } from "../../../../deps.ts";
import { CLIENT_ID, TOKEN_LIFETIME } from "../../../../config.ts";
import { server } from "../../../../liaison/server.ts";
import { CLIENT_KEY } from "../../../../certificates/google.ts";

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
    if (url.searchParams.get("error")) return redirectToHome();
    const code = url.searchParams.get("code");
    const redirectTo = url.searchParams.get("state");
    if (!code) return redirectToHome();
    const formData = new FormData();
    formData.append("client_id", CLIENT_ID);
    formData.append("client_secret", CLIENT_KEY);
    formData.append("grant_type", "authorization_code");
    formData.append(
      "redirect_uri",
      `${url.protocol}//${url.hostname}${url.pathname}`,
    );
    formData.append("code", code);
    const res = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        body: formData,
      },
    );
    const json = await res.json();
    const token = json.access_token;
    const data_res = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      },
    );
    const user_data = await data_res.json();
    if (!user_data.id) {
      return redirectToHome();
    }
    let location = redirectTo ?? "/";
    if (!(await server.accounts.getAccountById(user_data.id))) {
      location = `/set_name?redirectTo=${location}`;
    }
    await server.accounts.newAccount(user_data.id);
    const jwt = await server.accounts.getToken(user_data.id);
    if (!jwt) return redirectToHome();
    const headers = new Headers();
    setCookie(headers, {
      name: "auth",
      value: jwt,
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

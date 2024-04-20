import { getCookies } from "$std/http/cookie.ts";
import { Account } from "../liaison/liaison.ts";
import { server } from "../liaison/server.ts"

export function redirectToHome(): Response {
  const headers = new Headers();
  headers.set("location", "/");
  return new Response(null, {
    status: 303,
    headers,
  });
}

export async function getAccount(req: Request): Promise<Account | null> {
  const cookies = getCookies(req.headers);
  const token = cookies["auth"];
  if (!token) return null;
  return await server.accounts.getAccount(token);
}
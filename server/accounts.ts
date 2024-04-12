import { Payload, create, getNumericDate, verify } from "$djwt/mod.ts";
import { Account } from "../liaison/liaison.ts"
import { TOKEN_LIFETIME } from "../config.ts";


interface UserPayload extends Payload {
  id: string;
}

export class Accounts {
  private accounts: Map<string, Account> = new Map();
  private key?: CryptoKey;

  public async getToken(login: string, _password: string): Promise<string | null> {
    if (!login || login.length > 64) return null;
    console.log(`New user: ${login}`);
    const id = crypto.randomUUID();
    this.accounts.set(id, { id, name: login });
    return create({ alg: "HS256", typ: "JWT" }, {
      exp: getNumericDate(TOKEN_LIFETIME),
      id
    }, await this.getKey());
  }

  public async getId(jwt: string): Promise<string | null> {
    try {
      const payload = await verify<UserPayload>(jwt, await this.getKey());
      return payload.id;
    } catch {
      return null;
    }
  }

  // deno-lint-ignore require-await
  public async getAccountById(id: string): Promise<Account | null> {
    return this.accounts.get(id) ?? null;
  }

  public async getAccount(jwt: string): Promise<Account | null> {
    const id = await this.getId(jwt);
    if (!id) return null;
    return this.getAccountById(id);
  }

  private async getKey(): Promise<CryptoKey> {
    if (this.key) return this.key;
    return this.key = await crypto.subtle.generateKey(
      { name: "HMAC", hash: "SHA-256" },
      true,
      ["sign", "verify"]
    );
  }
}
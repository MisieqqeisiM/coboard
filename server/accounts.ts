import {
  create,
  getNumericDate,
  MongoClient,
  Payload,
  verify,
} from "../deps.ts";
import { Account } from "../liaison/liaison.ts";
import { TOKEN_LIFETIME } from "../config.ts";

interface UserPayload extends Payload {
  id: string;
}

export class Accounts {
  private accounts: Map<string, Account> = new Map();
  private key?: CryptoKey;

  public constructor(private mongoClient: MongoClient) {}

  public async newAccount(id: string) {
    const accounts = this.mongoClient.db("main").collection<Account>(
      "accounts",
    );
    if (!(await accounts.findOne({ id }))) {
      await accounts.insertOne({ id, name: "", boards: [] });
    }
  }

  public async setName(id: string, name: string) {
    const accounts = this.mongoClient.db("main").collection<Account>(
      "accounts",
    );
    await accounts.updateOne({ id }, { $set: { name } });
  }

  public async getToken(
    id: string,
  ): Promise<string | null> {
    return create({ alg: "HS256", typ: "JWT" }, {
      exp: getNumericDate(TOKEN_LIFETIME),
      id,
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

  public async getAccountById(id: string): Promise<Account | null> {
    return await this.mongoClient.db("main").collection<Account>("accounts")
      .findOne({ id });
  }

  public async getAccount(jwt: string): Promise<Account | null> {
    const id = await this.getId(jwt);
    if (!id) return null;
    return this.getAccountById(id);
  }

  private async getKey(): Promise<CryptoKey> {
    if (this.key) return this.key;

    const algorithm: HmacKeyGenParams = { name: "HMAC", hash: "SHA-256" };
    const extractable = true;
    const uses: KeyUsage[] = ["sign", "verify"];

    const collection = this.mongoClient
      .db("main")
      .collection<JsonWebKey>("key");

    const key = await collection.findOne();
    if (key) {
      this.key = await crypto.subtle.importKey(
        "jwk",
        key,
        algorithm,
        extractable,
        uses,
      );
    }

    if (!this.key) {
      this.key = await crypto.subtle.generateKey(algorithm, extractable, uses);
      await collection.insertOne(
        await crypto.subtle.exportKey("jwk", this.key),
      );
    }
    return this.key;
  }
}

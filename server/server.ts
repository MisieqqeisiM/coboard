import { User } from "../liaison/liaison.ts";
import { SocketServer, Client } from "../liaison/server.ts";
import { Header, Payload, create, getNumericDate, verify } from "$djwt/mod.ts"

function initUser(id: string, name: string): User {
  return {
    id,
    name,
    x: 0,
    y: 0,
    pings: 0,
  };
}

const key = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-256" },
  true,
  ["sign", "verify"]
);

interface UserPayload extends Payload {
  id: string;
}

export class Server {
  private clients: Array<Client> = [];
  private strokes: { x: number, y: number }[][] = [];
  private usernames: Map<string, string> = new Map();

  constructor(io: SocketServer) {
    io.use(async socket => {
      const token = socket.handshake.auth["token"] as string;
      if (!token) {
        socket.disconnect(true);
        return;
      }
      const id = await this.validate(token);
      if (!id) {
        socket.disconnect(true);
        return;
      }
      const name = this.usernames.get(id)!;

      const client = {
        user: initUser(id, name),
        socket,
      };

      this.clients.push(client);
      this.updateUsers();

      for (const stroke of this.strokes)
        client.socket.emit("onDraw", null, stroke);

      socket.on("reset", () => {
        this.strokes = [];
        for (const c of this.clients)
          c.socket.emit("onReset");
      });

      socket.on("disconnect", () => {
        this.clients.splice(this.clients.indexOf(client), 1);
        this.updateUsers();
      });

      socket.on("ping", () => {
        client.user.pings++;
        for (const c of this.clients) c.socket.emit("onPing", client.user.id);
      });

      socket.on("move", (x: number, y: number) => {
        client.user.x = x;
        client.user.y = y;
        for (const c of this.clients)
          c.socket.emit("onMove", client.user.id, client.user.x, client.user.y);
      });

      socket.on("draw", (points: { x: number, y: number }[]) => {
        this.strokes.push(points);
        for (const c of this.clients)
          c.socket.emit("onDraw", socket.id, points);
      });
    });
  }

  private updateUsers(): void {
    for (const c of this.clients)
      c.socket.emit(
        "userList",
        this.clients.map((c) => c.user)
      );
  }

  public async auth(login: string, _password: string): Promise<string | null> {
    if (login.length > 64)
      return null;
    console.log(`New user: ${login}`);
    const header: Header = {
      alg: "HS256",
      typ: "JWT",
    };

    const id = crypto.randomUUID();
    const payload: UserPayload = {
      iss: "test",
      exp: getNumericDate(300),
      id
    }

    this.usernames.set(id, login);

    return await create(header, payload, key);
  }

  public async validate(jwt: string): Promise<string | null> {
    try {
      const payload = await verify<UserPayload>(jwt, key);
      return payload.id;
    } catch {
      return null;
    }
  }
}

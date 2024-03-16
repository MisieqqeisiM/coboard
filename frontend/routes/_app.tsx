import { type PageProps } from "$fresh/server.ts";
import { createServer } from "../../liaison/liaison.ts"
import { WithClient } from "../islands/WithClient.tsx";

const server = createServer();

export default function App({ Component }: PageProps) {
  console.log(`clients: ${server.getClients()}`);

  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>coboard</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <WithClient>
          <Component />
        </WithClient>
      </body>
    </html>
  );
}

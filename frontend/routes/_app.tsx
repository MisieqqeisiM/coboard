import { type PageProps } from "$fresh/server.ts";
import { WithClient } from "../islands/app/WithClient.tsx";
import { server } from "../../liaison/server.ts";

server;

export default function App({ Component }: PageProps) {
  return (
    <html style="overflow: hidden; width: 100%; height: 100%; overscroll-behavior-y: contain">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>coboard</title>
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="/board_styles.css" />
        <link rel="stylesheet" href="/login_styles.css" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}

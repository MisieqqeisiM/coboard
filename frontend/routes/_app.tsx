import { type PageProps } from "../../deps.ts";
import { server } from "../../liaison/server.ts";

server;

export default function App({ Component }: PageProps) {
  return (
    <html style="overflow: hidden; width: 100%; height: 100%; overscroll-behavior-y: contain">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="stylesheet" href="/board_styles.css" />
        <link rel="stylesheet" href="/login_styles.css" />
        <link
          href="//fonts.googleapis.com/css?family=Raleway:400,300,600"
          rel="stylesheet"
          type="text/css"
        />

        <link rel="stylesheet" href="skeleton/normalize.css" />
        <link rel="stylesheet" href="skeleton/skeleton.css" />
        <title>Coboard</title>

        <meta property="og:url" content="https://coboard.pl/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Coboard" />
        <meta
          property="og:description"
          content="The best opensource web whiteboard."
        />
        <meta property="og:image" content="https://coboard.pl/thumbnail.png" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body>
        <Component />
        <script
          type="module"
          src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"
        >
        </script>
        <script
          nomodule
          src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"
        >
        </script>
      </body>
    </html>
  );
}

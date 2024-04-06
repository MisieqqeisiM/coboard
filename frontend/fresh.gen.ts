// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $api_login from "./routes/api/login.ts";
import * as $api_logout from "./routes/api/logout.ts";
import * as $index from "./routes/index.tsx";
import * as $app_Loading from "./islands/app/Loading.tsx";
import * as $app_LoginForm from "./islands/app/LoginForm.tsx";
import * as $app_WithClient from "./islands/app/WithClient.tsx";
import * as $board_Board from "./islands/board/Board.tsx";
import * as $board_ClientList from "./islands/board/ClientList.tsx";
import * as $board_CursorBox from "./islands/board/CursorBox.tsx";
import * as $board_MouseTracker from "./islands/board/MouseTracker.tsx";
import * as $board_PingButton from "./islands/board/PingButton.tsx";
import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/api/login.ts": $api_login,
    "./routes/api/logout.ts": $api_logout,
    "./routes/index.tsx": $index,
  },
  islands: {
    "./islands/app/Loading.tsx": $app_Loading,
    "./islands/app/LoginForm.tsx": $app_LoginForm,
    "./islands/app/WithClient.tsx": $app_WithClient,
    "./islands/board/Board.tsx": $board_Board,
    "./islands/board/ClientList.tsx": $board_ClientList,
    "./islands/board/CursorBox.tsx": $board_CursorBox,
    "./islands/board/MouseTracker.tsx": $board_MouseTracker,
    "./islands/board/PingButton.tsx": $board_PingButton,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;

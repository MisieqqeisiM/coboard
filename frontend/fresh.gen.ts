// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_board_ from "./routes/[board].tsx";
import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $api_login_anonymous from "./routes/api/login/anonymous.ts";
import * as $api_login_google from "./routes/api/login/google.ts";
import * as $api_logout from "./routes/api/logout.ts";
import * as $api_new_board from "./routes/api/new_board.tsx";
import * as $api_remove_user_from_board from "./routes/api/remove_user_from_board.tsx";
import * as $api_rename_board from "./routes/api/rename_board.tsx";
import * as $api_set_name from "./routes/api/set_name.ts";
import * as $index from "./routes/index.tsx";
import * as $set_name from "./routes/set_name.tsx";
import * as $app_BoardTileToolbar from "./islands/app/BoardTileToolbar.tsx";
import * as $app_DashboardMenu from "./islands/app/DashboardMenu.tsx";
import * as $app_IconCircle from "./islands/app/IconCircle.tsx";
import * as $app_LoginForm from "./islands/app/LoginForm.tsx";
import * as $app_Reload from "./islands/app/Reload.tsx";
import * as $app_SetName from "./islands/app/SetName.tsx";
import * as $app_ThemeSelector from "./islands/app/ThemeSelector.tsx";
import * as $app_Themed from "./islands/app/Themed.tsx";
import * as $app_WithClient from "./islands/app/WithClient.tsx";
import * as $board_AccountMenu from "./islands/board/AccountMenu.tsx";
import * as $board_Board from "./islands/board/Board.tsx";
import * as $board_CameraView from "./islands/board/CameraView.tsx";
import * as $board_Canvas from "./islands/board/Canvas.tsx";
import * as $board_ColorSelector from "./islands/board/ColorSelector.tsx";
import * as $board_Controls from "./islands/board/Controls.tsx";
import * as $board_CursorBox from "./islands/board/CursorBox.tsx";
import * as $board_MouseTracker from "./islands/board/MouseTracker.tsx";
import * as $board_ShareSelector from "./islands/board/ShareSelector.tsx";
import * as $board_SizeSelector from "./islands/board/SizeSelector.tsx";
import * as $board_StylusModeSelector from "./islands/board/StylusModeSelector.tsx";
import * as $board_ToolSelector from "./islands/board/ToolSelector.tsx";
import * as $board_Toolbar from "./islands/board/Toolbar.tsx";
import * as $board_behaviors_Behavior from "./islands/board/behaviors/Behavior.ts";
import * as $board_behaviors_DrawBehavior from "./islands/board/behaviors/DrawBehavior.ts";
import * as $board_behaviors_EllipseBehaviour from "./islands/board/behaviors/EllipseBehaviour.ts";
import * as $board_behaviors_EraseBehavior from "./islands/board/behaviors/EraseBehavior.ts";
import * as $board_behaviors_LineBehaviour from "./islands/board/behaviors/LineBehaviour.ts";
import * as $board_behaviors_MoveBehavior from "./islands/board/behaviors/MoveBehavior.ts";
import * as $board_behaviors_PolyLine from "./islands/board/behaviors/PolyLine.ts";
import * as $board_behaviors_Polygon from "./islands/board/behaviors/Polygon.ts";
import * as $board_behaviors_RectangleBehaviour from "./islands/board/behaviors/RectangleBehaviour.ts";
import * as $board_behaviors_geometry_utils from "./islands/board/behaviors/geometry_utils.ts";
import * as $board_webgl_utils_LineBuffer from "./islands/board/webgl-utils/LineBuffer.ts";
import * as $board_webgl_utils_LineDrawer from "./islands/board/webgl-utils/LineDrawer.ts";
import * as $board_webgl_utils_constants from "./islands/board/webgl-utils/constants.ts";
import * as $board_webgl_utils_index from "./islands/board/webgl-utils/index.ts";
import * as $board_webgl_utils_line_drawing from "./islands/board/webgl-utils/line_drawing.ts";
import * as $board_webgl_utils_utils from "./islands/board/webgl-utils/utils.ts";
import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/[board].tsx": $_board_,
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/api/login/anonymous.ts": $api_login_anonymous,
    "./routes/api/login/google.ts": $api_login_google,
    "./routes/api/logout.ts": $api_logout,
    "./routes/api/new_board.tsx": $api_new_board,
    "./routes/api/remove_user_from_board.tsx": $api_remove_user_from_board,
    "./routes/api/rename_board.tsx": $api_rename_board,
    "./routes/api/set_name.ts": $api_set_name,
    "./routes/index.tsx": $index,
    "./routes/set_name.tsx": $set_name,
  },
  islands: {
    "./islands/app/BoardTileToolbar.tsx": $app_BoardTileToolbar,
    "./islands/app/DashboardMenu.tsx": $app_DashboardMenu,
    "./islands/app/IconCircle.tsx": $app_IconCircle,
    "./islands/app/LoginForm.tsx": $app_LoginForm,
    "./islands/app/Reload.tsx": $app_Reload,
    "./islands/app/SetName.tsx": $app_SetName,
    "./islands/app/ThemeSelector.tsx": $app_ThemeSelector,
    "./islands/app/Themed.tsx": $app_Themed,
    "./islands/app/WithClient.tsx": $app_WithClient,
    "./islands/board/AccountMenu.tsx": $board_AccountMenu,
    "./islands/board/Board.tsx": $board_Board,
    "./islands/board/CameraView.tsx": $board_CameraView,
    "./islands/board/Canvas.tsx": $board_Canvas,
    "./islands/board/ColorSelector.tsx": $board_ColorSelector,
    "./islands/board/Controls.tsx": $board_Controls,
    "./islands/board/CursorBox.tsx": $board_CursorBox,
    "./islands/board/MouseTracker.tsx": $board_MouseTracker,
    "./islands/board/ShareSelector.tsx": $board_ShareSelector,
    "./islands/board/SizeSelector.tsx": $board_SizeSelector,
    "./islands/board/StylusModeSelector.tsx": $board_StylusModeSelector,
    "./islands/board/ToolSelector.tsx": $board_ToolSelector,
    "./islands/board/Toolbar.tsx": $board_Toolbar,
    "./islands/board/behaviors/Behavior.ts": $board_behaviors_Behavior,
    "./islands/board/behaviors/DrawBehavior.ts": $board_behaviors_DrawBehavior,
    "./islands/board/behaviors/EllipseBehaviour.ts":
      $board_behaviors_EllipseBehaviour,
    "./islands/board/behaviors/EraseBehavior.ts":
      $board_behaviors_EraseBehavior,
    "./islands/board/behaviors/LineBehaviour.ts":
      $board_behaviors_LineBehaviour,
    "./islands/board/behaviors/MoveBehavior.ts": $board_behaviors_MoveBehavior,
    "./islands/board/behaviors/PolyLine.ts": $board_behaviors_PolyLine,
    "./islands/board/behaviors/Polygon.ts": $board_behaviors_Polygon,
    "./islands/board/behaviors/RectangleBehaviour.ts":
      $board_behaviors_RectangleBehaviour,
    "./islands/board/behaviors/geometry_utils.ts":
      $board_behaviors_geometry_utils,
    "./islands/board/webgl-utils/LineBuffer.ts": $board_webgl_utils_LineBuffer,
    "./islands/board/webgl-utils/LineDrawer.ts": $board_webgl_utils_LineDrawer,
    "./islands/board/webgl-utils/constants.ts": $board_webgl_utils_constants,
    "./islands/board/webgl-utils/index.ts": $board_webgl_utils_index,
    "./islands/board/webgl-utils/line_drawing.ts":
      $board_webgl_utils_line_drawing,
    "./islands/board/webgl-utils/utils.ts": $board_webgl_utils_utils,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;

import { Partial } from "../../../deps.ts";
import { server } from "../../../liaison/server.ts";
import { defineRoute } from "$fresh/src/server/defines.ts";
import { getAccount } from "../../../server/utils.ts";
import Reload from "../../islands/app/Reload.tsx";
import BoardTile from "../../components/BoardTile.tsx";

export default defineRoute(async (req, ctx) => {
  const account = await getAccount(req);
  if (!account) {
    return (
      <Partial name="boards" mode="replace">
        <Reload />
      </Partial>
    );
  }

  const searchParams = new URLSearchParams(
    req.url.substring(req.url.indexOf("?") + 1)
  );

  const boardId = searchParams.get("boardId");
  const newName = searchParams.get("name");

  if (boardId && newName) {
    await server.boards.RenameBoard(boardId, newName);
  }
  return (
    <Partial name="boards" mode="replace">
      <Reload />
    </Partial>
  );
});

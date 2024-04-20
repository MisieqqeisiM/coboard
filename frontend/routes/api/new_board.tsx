import { Partial } from "$fresh/runtime.ts";
import { server } from "../../../liaison/server.ts";
import { defineRoute } from "$fresh/src/server/defines.ts";
import { getAccount, redirectToHome } from "../../../server/utils.ts";
import BoardTile from "../../components/BoardTile.tsx";
import Reload from "../../islands/app/Reload.tsx";

export default defineRoute(async (req, ctx) => {
  const account = await getAccount(req);
  if (!account) {
    return (
      <Partial name="boards" mode="append">
        <Reload />
      </Partial>
    );
  }

  const board = await server.boards.newBoard();
  await server.boards.addUserToBoard(account.id, board);

  return (
    <Partial name="boards" mode="append">
      <BoardTile key={board} id={board} name={board} />
    </Partial>
  );
});

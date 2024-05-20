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
      <Partial name="boards" mode="append">
        <Reload />
      </Partial>
    );
  }

  const board = await server.boards.newBoard();
  await server.boards.addUserToBoard(account.id, board.id);

  return (
    <Partial name="boards" mode="append">
      <BoardTile key={board.id} id={board.id} name={board.name} />
    </Partial>
  );
});

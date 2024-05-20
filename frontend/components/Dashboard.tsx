import { Partial } from "../../deps_client.ts";
import DashboardMenu from "../islands/app/DashboardMenu.tsx";
import BoardTile from "./BoardTile.tsx";
import { BoardTileProps } from "./BoardTile.tsx";

interface DashboardPars {
  boards: Array<BoardTileProps>;
}

export default function Dashboard({ boards }: DashboardPars) {
  return (
    <>
      <div class="container" style={{ height: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 5,
            flexWrap: "wrap",
            overflowY: "scroll",
            maxHeight: "calc(100% - 110px)",
            marginTop: 90,
            marginBottom: 20,
          }}
          f-client-nav
        >
          <Partial name="boards">
            <a
              class="board-tile colored"
              href="/"
              f-partial="/api/new_board"
              key="new"
            >
              new
            </a>
            {boards.map((board) => (
              <BoardTile key={board.id} id={board.id} name={board.name} />
            ))}
          </Partial>
        </div>
      </div>
      <DashboardMenu />
    </>
  );
}

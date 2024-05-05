import { Partial } from "../../deps_client.ts";
import AccountMenu from "../islands/board/AccountMenu.tsx";
import BoardTile from "./BoardTile.tsx";
import IconCircle from "../islands/app/IconCircle.tsx";
import DashboardMenu from "../islands/app/DashboardMenu.tsx";

interface DashboardPars {
  boards: Array<string>;
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
            maxHeight: "calc(100% - 40px)",
            margin: 20,
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
              <BoardTile key={board} id={board} name={board} />
            ))}
          </Partial>
        </div>
      </div>
      <DashboardMenu />
    </>
  );
}

import { Partial } from "../../deps.ts";
import BoardTile from "./BoardTile.tsx";

interface DashboardPars {
  boards: Array<string>;
}

export default function Dashboard({ boards }: DashboardPars) {
  return (
    <>
      <div class="container" style="height: 100%;">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            flexDirection: "row",
            marginTop: 50,
            fontSize: 70,
          }}
        >
          <img src="/icons/coboard.svg" style={{ height: 90 }}>
          </img>
          oboard
        </div>
        <hr />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 5,
            flexWrap: "wrap",
            overflowY: "scroll",
            maxHeight: "calc(100% - 230px)",
          }}
          f-client-nav
        >
          <Partial name="boards">
            <a
              class="button button-primary"
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
    </>
  );
}

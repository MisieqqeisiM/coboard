import BoardTile from "./BoardTile.tsx";

interface DashboardPars {
  boards: Array<string>;
}

export default function Dashboard({ boards }: DashboardPars) {
  return (
    <>
      <div class="container">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            flexDirection: "row",
            marginTop: 50,
            fontSize: 100,
          }}
        >
          <img src="/icons/coboard.svg"></img>
          oboard
        </div>
        <hr />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 5,
            flexWrap: "wrap",
          }}
        >
          {boards.map((board) => <BoardTile id={board} name={board} />)}
          <BoardTile id="api/new_board" name="new" />
        </div>
      </div>
    </>
  );
}

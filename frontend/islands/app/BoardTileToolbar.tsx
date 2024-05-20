import { useState } from "preact/hooks";

export default function BoardTileToolbar({ boardId }: { boardId: string }) {
  const [boardName, setBoardName] = useState("");

  return (
    <>
      <a
        href="/"
        f-partial={
          "/api/rename_board?boardId=" + boardId + "&name=" + boardName
        }
      >
        <img class="board-image" src="/pencil.svg" />
      </a>
      <input
        class="board-tile"
        type="text"
        onInput={(event) => {
          if (event.target != null) {
            setBoardName((event.target as HTMLInputElement).value);
          }
        }}
      />
    </>
  );
}

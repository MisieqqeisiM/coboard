import BoardTileToolbar from "../islands/app/BoardTileToolbar.tsx";

export interface BoardTileProps {
  id: string;
  name: string;
}
export default function BoardTile({ id, name }: BoardTileProps) {
  return (
    <div class="board-tile-block">
      {id != "general" ? (
        <div>
          <a href="/" f-partial={"/api/remove_user_from_board?boardId=" + id}>
            <img class="board-image" src="/icons/trash.svg" />
          </a>
          <BoardTileToolbar key={id} boardId={id} />
        </div>
      ) : null}
      <a class="board-tile" href={`/${id}`} f-client-nav={false}>
        {name}
      </a>
    </div>
  );
}

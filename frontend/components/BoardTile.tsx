import { FileTextChanges } from "https://deno.land/x/ts_morph@21.0.1/ts_morph.js";

interface BoardTileProps {
  id: string;
  name: string;
}
export default function BoardTile({ id, name }: BoardTileProps) {
  return (
    <a
      class="board-tile"
      href={`/${id}`}
      f-client-nav={false}
    >
      {name}
    </a>
  );
}

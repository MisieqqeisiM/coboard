interface BoardTileProps {
  id: string;
  name: string;
}
export default function BoardTile({ id, name }: BoardTileProps) {
  return (
    <a
      class="button"
      href={`/${id}`}
    >
      {name}
    </a>
  );
}

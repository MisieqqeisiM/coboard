interface CursorProps {
  name: string;
  x: number;
  y: number;
}

export function Cursor(props: CursorProps) {
  return (
    <div
      class="cursor"
      style={`transform: translate(${props.x}px, ${props.y}px)`}
    >
      <img class="dot" src="/pencil.svg" width="30" height="30" />
      <div class="label">
        <b>{props.name}</b>
      </div>
    </div>
  );
}

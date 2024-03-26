
interface CursorProps {
  name: string;
  x: number;
  y: number;
}

export function Cursor(props: CursorProps) {
  return (
    <div class="cursor" style={`transform: translate(${props.x}px, ${props.y}px)`}>
      <div class="dot"> </div>
      <div class="label"><b>{props.name}</b></div>
    </div>
  );
}

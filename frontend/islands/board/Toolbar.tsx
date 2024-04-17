import ColorSelector from "./ColorSelector.tsx";
import ToolSelector from "./ToolSelector.tsx";
export default function Toolbar() {
  return (
    <div class="toolbar">
      <div class="toolbar-content">
        <ColorSelector />
        <ToolSelector />
      </div>
    </div>
  );
}

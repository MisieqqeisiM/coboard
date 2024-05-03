import { useContext } from "../../../deps.ts";
import IconCircle from "../../components/IconCircle.tsx";
import AccountMenu from "./AccountMenu.tsx";
import ColorSelector from "./ColorSelector.tsx";
import ToolSelector from "./ToolSelector.tsx";
import { ClientContext } from "../app/WithClient.tsx";
import StylusModeSelector from "./StylusModeSelector.tsx";
import SizeSelector from "./SizeSelector.tsx";
export default function Toolbar() {
  const client = useContext(ClientContext);
  return (
    <div class="toolbar">
      <div class="toolbar-content">
        <AccountMenu>
          <IconCircle
            iconName="refresh-circle-outline"
            color="red"
            onClick={() => {
              client?.socket.reset();
            }}
          />
          <IconCircle
            iconName="grid-outline"
            onClick={() => {
              globalThis.location.href = "/";
            }}
          />
          <IconCircle
            iconName="exit-outline"
            onClick={() => {
              globalThis.location.href = "/api/logout";
            }}
          />
        </AccountMenu>
        <ColorSelector />
        <SizeSelector />
        <ToolSelector />
        <StylusModeSelector />
      </div>
    </div>
  );
}
